'use strict';

const browserApi = window.browser || window.chrome;
const MODE_STORAGE_KEY = 'tidyMode';
const statusElement = document.getElementById('status');
const applyButton = document.getElementById('applyBtn');
const restoreButton = document.getElementById('restoreBtn');
const pageStateValueElement = document.getElementById('pageStateValue');
const activeModeValueElement = document.getElementById('activeModeValue');

document.addEventListener('DOMContentLoaded', initPopup);

async function initPopup() {
  await restoreSavedMode();
  await refreshPageState();

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
    pageStateValueElement.textContent = 'Unavailable';
    activeModeValueElement.textContent = formatModeLabel(getSelectedMode());
    statusElement.textContent = 'This page does not allow extension messaging.';
  }
}

async function sendMessageToActiveTab(message) {
  const tabs = await browserApi.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs && tabs[0];

  if (!activeTab || typeof activeTab.id !== 'number') {
    throw new Error('No active tab found.');
  }

  return browserApi.tabs.sendMessage(activeTab.id, message);
}

function updateUiFromState(state) {
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
