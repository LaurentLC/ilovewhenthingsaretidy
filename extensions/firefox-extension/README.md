# Firefox extension

Minimal Firefox WebExtension for **I love when things are tidy**.

It rewrites the visible text of the current page by sorting or shuffling letters inside words while preserving punctuation, spacing, and layout.

## Features

- `A-Z` mode
- `Z-A` mode
- `Random` mode
- manual apply on the current tab
- restore without reloading the page
- exclusions for editable and code-heavy areas

## Load it in Firefox

1. Open `about:debugging`
2. Click `This Firefox`
3. Click `Load Temporary Add-on...`
4. Select [manifest.json](/Users/llc/Documents/divers/__websites/__MAMP_ROOT/dev-divers/ilovewhenthingsaretidy/extensions/firefox-extension/manifest.json)

## Files

- [manifest.json](/Users/llc/Documents/divers/__websites/__MAMP_ROOT/dev-divers/ilovewhenthingsaretidy/extensions/firefox-extension/manifest.json): extension manifest
- [popup.html](/Users/llc/Documents/divers/__websites/__MAMP_ROOT/dev-divers/ilovewhenthingsaretidy/extensions/firefox-extension/popup.html): popup markup
- [popup.js](/Users/llc/Documents/divers/__websites/__MAMP_ROOT/dev-divers/ilovewhenthingsaretidy/extensions/firefox-extension/popup.js): popup state and tab messaging
- [content-script.js](/Users/llc/Documents/divers/__websites/__MAMP_ROOT/dev-divers/ilovewhenthingsaretidy/extensions/firefox-extension/content-script.js): page-side entry point
- [core/transform.js](/Users/llc/Documents/divers/__websites/__MAMP_ROOT/dev-divers/ilovewhenthingsaretidy/extensions/firefox-extension/core/transform.js): text transformation helpers
- [core/dom.js](/Users/llc/Documents/divers/__websites/__MAMP_ROOT/dev-divers/ilovewhenthingsaretidy/extensions/firefox-extension/core/dom.js): DOM traversal, exclusions, restore logic
