# Chrome extension

Minimal Chrome extension for **I love when things are tidy**: https://tidy.grmblx.com

It rewrites the visible text of the current page by sorting or shuffling letters inside words while preserving punctuation, spacing, and layout.

## Features

- `A-Z` mode
- `Z-A` mode
- `Random` mode
- manual apply on the current tab
- restore without reloading the page
- exclusions for editable and code-heavy areas

## Load locally in Chrome

1. Open `chrome://extensions`
2. Enable `Developer mode`
3. Click `Load unpacked`
4. Select the `extensions/chrome-extension` folder

## Chrome Web Store preparation

- Manifest is `MV3`
- Toolbar and store icons are provided as PNG files
- Host access is currently set to `<all_urls>` because the extension rewrites page text on the active site
