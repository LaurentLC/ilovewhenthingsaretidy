'use strict';

const browserApi = window.browser || window.chrome;
const MODE_STORAGE_KEY = 'tidyMode';
const statusElement = document.getElementById('status');
const applyButton = document.getElementById('applyBtn');
const restoreButton = document.getElementById('restoreBtn');

document.addEventListener('DOMContentLoaded', initPopup);

async function initPopup() {
  await restoreSavedMode();

  applyButton.addEventListener('click', () => {
    handleApply().catch(handlePopupError);
  });

  restoreButton.addEventListener('click', () => {
    handleRestore().catch(handlePopupError);
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
  const response = await sendMessageToActiveTab({ action: 'apply', mode });
  statusElement.textContent = response && response.message ? response.message : 'Applied.';
}

async function handleRestore() {
  const response = await sendMessageToActiveTab({ action: 'restore' });
  statusElement.textContent = response && response.message ? response.message : 'Restored.';
}

async function sendMessageToActiveTab(message) {
  const tabs = await browserApi.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs && tabs[0];

  if (!activeTab || typeof activeTab.id !== 'number') {
    throw new Error('No active tab found.');
  }

  return browserApi.tabs.sendMessage(activeTab.id, message);
}

function handlePopupError(error) {
  statusElement.textContent = error && error.message ? error.message : 'Something went wrong.';
}
