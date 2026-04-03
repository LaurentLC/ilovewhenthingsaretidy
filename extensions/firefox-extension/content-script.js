'use strict';

const tidySession = new TidyDomSession();

browser.runtime.onMessage.addListener(message => {
  if (!message || !message.action) {
    return Promise.resolve({ message: 'No action received.' });
  }

  if (message.action === 'get-state') {
    return Promise.resolve({
      state: tidySession.getState()
    });
  }

  if (message.action === 'apply') {
    const transformedCount = tidySession.apply(message.mode || 'asc');
    const noun = transformedCount === 1 ? 'text node' : 'text nodes';

    return Promise.resolve({
      message: `Applied to ${transformedCount} ${noun}.`,
      state: tidySession.getState()
    });
  }

  if (message.action === 'restore') {
    const restoredCount = tidySession.restore();
    const noun = restoredCount === 1 ? 'text node' : 'text nodes';

    return Promise.resolve({
      message: `Restored ${restoredCount} ${noun}.`,
      state: tidySession.getState()
    });
  }

  return Promise.resolve({ message: 'Unknown action.' });
});
