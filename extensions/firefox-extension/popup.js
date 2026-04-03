'use strict';

const browserApi = window.browser || window.chrome;
const MODE_STORAGE_KEY = 'tidyMode';
const SITE_MODES_STORAGE_KEY = 'siteModes';
const statusElement = document.getElementById('status');
const applyButton = document.getElementById('applyBtn');
const restoreButton = document.getElementById('restoreBtn');
const siteValueElement = document.getElementById('siteValue');
const pageStateValueElement = document.getElementById('pageStateValue');
const activeModeValueElement = document.getElementById('activeModeValue');
const autoApplyCheckbox = document.getElementById('autoApplyCheckbox');
let activeTabInfo = null;

document.addEventListener('DOMContentLoaded', initPopup);

async function initPopup() {
  activeTabInfo = await getActiveTab();
  await restoreSavedMode();
  await restoreSiteSetting();
  await refreshPageState();

  applyButton.addEventListener('click', () => {
    handleApply().catch(handlePopupError);
  });

  restoreButton.addEventListener('click', () => {
    handleRestore().catch(handlePopupError);
  });

  autoApplyCheckbox.addEventListener('change', () => {
    handleAutoApplyToggle().catch(handlePopupError);
  });

  document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener('change', () => {
      handleModeChange().catch(handlePopupError);
    });
  });
}

async function restoreSavedMode() {
  const stored = await browserApi.storage.local.get(MODE_STORAGE_KEY);
  const savedMode = stored[MODE_STORAGE_KEY];

  if (!savedMode) {
    return;
  }

  const radio = document.querySelector(`input[name="mode"][value="${savedMode}"]`);

  if (radio) {
    radio.checked = true;
  }
}

function getSelectedMode() {
  const checked = document.querySelector('input[name="mode"]:checked');
  return checked ? checked.value : 'asc';
}

async function handleApply() {
  const mode = getSelectedMode();
  await browserApi.storage.local.set({ [MODE_STORAGE_KEY]: mode });
  await syncCurrentSitePreference(mode);
  const response = await sendMessageToActiveTab({ action: 'apply', mode });
  statusElement.textContent = response && response.message ? response.message : 'Applied.';
  updateUiFromState(response && response.state ? response.state : null);
}

async function handleRestore() {
  const response = await sendMessageToActiveTab({ action: 'restore' });
  statusElement.textContent = response && response.message ? response.message : 'Restored.';
  updateUiFromState(response && response.state ? response.state : null);
}

async function refreshPageState() {
  try {
    const response = await sendMessageToActiveTab({ action: 'get-state' });
    updateUiFromState(response && response.state ? response.state : null);
  } catch (error) {
    siteValueElement.textContent = getCurrentHostname() || 'Unavailable';
    pageStateValueElement.textContent = 'Unavailable';
    activeModeValueElement.textContent = formatModeLabel(getSelectedMode());
    statusElement.textContent = 'This page does not allow extension messaging.';
  }
}

async function getActiveTab() {
  const tabs = await browserApi.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs && tabs[0];

  if (!activeTab || typeof activeTab.id !== 'number') {
    throw new Error('No active tab found.');
  }

  return activeTab;
}

async function sendMessageToActiveTab(message) {
  if (!activeTabInfo) {
    activeTabInfo = await getActiveTab();
  }

  return browserApi.tabs.sendMessage(activeTabInfo.id, message);
}

function updateUiFromState(state) {
  siteValueElement.textContent = getCurrentHostname() || 'Unavailable';

  if (!state) {
    pageStateValueElement.textContent = 'Unknown';
    activeModeValueElement.textContent = formatModeLabel(getSelectedMode());
    return;
  }

  pageStateValueElement.textContent = state.isTransformed ? 'Transformed' : 'Original';
  activeModeValueElement.textContent = formatModeLabel(state.currentMode || getSelectedMode());

  const radio = document.querySelector(`input[name="mode"][value="${state.currentMode}"]`);
  if (radio) {
    radio.checked = true;
  }
}

async function restoreSiteSetting() {
  const hostname = getCurrentHostname();
  siteValueElement.textContent = hostname || 'Unavailable';

  if (!hostname) {
    autoApplyCheckbox.checked = false;
    autoApplyCheckbox.disabled = true;
    return;
  }

  const stored = await browserApi.storage.local.get(SITE_MODES_STORAGE_KEY);
  const siteModes = stored[SITE_MODES_STORAGE_KEY] || {};
  const savedMode = siteModes[hostname];

  autoApplyCheckbox.checked = typeof savedMode === 'string';

  if (savedMode) {
    const radio = document.querySelector(`input[name="mode"][value="${savedMode}"]`);
    if (radio) {
      radio.checked = true;
    }
  }
}

async function handleAutoApplyToggle() {
  const mode = getSelectedMode();
  await syncCurrentSitePreference(mode);
  statusElement.textContent = autoApplyCheckbox.checked
    ? `Auto-apply enabled for ${getCurrentHostname()}.`
    : `Auto-apply disabled for ${getCurrentHostname()}.`;
}

async function handleModeChange() {
  const mode = getSelectedMode();
  activeModeValueElement.textContent = formatModeLabel(mode);
  await browserApi.storage.local.set({ [MODE_STORAGE_KEY]: mode });
  await syncCurrentSitePreference(mode);
}

async function syncCurrentSitePreference(mode) {
  const hostname = getCurrentHostname();

  if (!hostname) {
    return;
  }

  const stored = await browserApi.storage.local.get(SITE_MODES_STORAGE_KEY);
  const siteModes = stored[SITE_MODES_STORAGE_KEY] || {};

  if (autoApplyCheckbox.checked) {
    siteModes[hostname] = mode;
  } else {
    delete siteModes[hostname];
  }

  await browserApi.storage.local.set({ [SITE_MODES_STORAGE_KEY]: siteModes });
}

function getCurrentHostname() {
  if (!activeTabInfo || !activeTabInfo.url) {
    return '';
  }

  try {
    const url = new URL(activeTabInfo.url);
    if (!/^https?:$/.test(url.protocol)) {
      return '';
    }
    return url.hostname;
  } catch (error) {
    return '';
  }
}

function formatModeLabel(mode) {
  if (mode === 'desc') {
    return 'Z-A';
  }

  if (mode === 'random') {
    return 'Random';
  }

  return 'A-Z';
}

function handlePopupError(error) {
  statusElement.textContent = error && error.message ? error.message : 'Something went wrong.';
}
