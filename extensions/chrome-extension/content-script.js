'use strict';

const tidySession = new TidyDomSession();
const SITE_MODES_STORAGE_KEY = 'siteModes';
const extensionRuntime = createRuntimeApi();
const extensionStorage = createStorageApi();

initializeAutoApply().catch(() => {});

extensionRuntime.onMessage.addListener((message, sender, sendResponse) => {
  sendResponse(handleMessage(message));
  return false;
});

async function initializeAutoApply() {
  const hostname = getCurrentHostname();

  if (!hostname || !document.body) {
    return;
  }

  const stored = await extensionStorage.get(SITE_MODES_STORAGE_KEY);
  const siteModes = stored[SITE_MODES_STORAGE_KEY] || {};
  const mode = siteModes[hostname];

  if (!mode) {
    return;
  }

  tidySession.apply(mode);
}

function getCurrentHostname() {
  try {
    if (!/^https?:$/.test(window.location.protocol)) {
      return '';
    }

    return window.location.hostname;
  } catch (error) {
    return '';
  }
}

function handleMessage(message) {
  if (!message || !message.action) {
    return { message: 'No action received.' };
  }

  if (message.action === 'get-state') {
    return {
      state: tidySession.getState()
    };
  }

  if (message.action === 'apply') {
    const transformedCount = tidySession.apply(message.mode || 'asc');
    const noun = transformedCount === 1 ? 'text node' : 'text nodes';

    return {
      message: `Applied to ${transformedCount} ${noun}.`,
      state: tidySession.getState()
    };
  }

  if (message.action === 'restore') {
    const restoredCount = tidySession.restore();
    const noun = restoredCount === 1 ? 'text node' : 'text nodes';

    return {
      message: `Restored ${restoredCount} ${noun}.`,
      state: tidySession.getState()
    };
  }

  return { message: 'Unknown action.' };
}

function createRuntimeApi() {
  if (window.browser && window.browser.runtime && window.browser.runtime.onMessage) {
    return window.browser.runtime;
  }

  return window.chrome.runtime;
}

function createStorageApi() {
  if (window.browser && window.browser.storage && window.browser.storage.local) {
    return window.browser.storage.local;
  }

  return {
    get(keys) {
      return new Promise((resolve, reject) => {
        window.chrome.storage.local.get(keys, result => {
          if (window.chrome.runtime.lastError) {
            reject(new Error(window.chrome.runtime.lastError.message));
            return;
          }

          resolve(result);
        });
      });
    }
  };
}
