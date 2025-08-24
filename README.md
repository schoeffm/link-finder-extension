# Type-Ahead Find Extension for Microsoft Edge

A browser extension that allows you to quickly find and navigate to links on any webpage by typing `/` followed by your search term.

## Features

- **Quick Search**: Press `/` to start searching for links
- **Instant Results**: Links are highlighted as you type
- **Keyboard Navigation**: Use arrow keys to navigate between matches
- **Quick Access**: Press Enter to follow the selected link
- **Smart Matching**: Searches both link text and URLs

## Installation

1. Clone or download this repository
2. Open Microsoft Edge
3. Navigate to `edge://extensions/`
4. Enable "Developer mode" in the bottom left
5. Click "Load unpacked" 
6. Select the folder containing these extension files
7. The extension will be installed and ready to use

## Usage

1. Navigate to any webpage
2. Press `/` to activate the search (works anywhere except in input fields)
3. Type your search term to find matching links
4. Use ↑/↓ arrow keys to navigate between matches
5. Press Enter to follow the selected link
6. Press Escape to cancel the search

## Keyboard Shortcuts

- `/` - Activate search mode
- `Type` - Search for links
- `↑` / `Shift+Tab` - Select previous link
- `↓` / `Tab` - Select next link
- `Enter` - Follow selected link
- `Escape` - Cancel search
- `Backspace` - Remove last character (or exit if search is empty)

## Files

- `manifest.json` - Extension configuration
- `content.js` - Main functionality script
- `styles.css` - Visual styling for search interface
- `popup.html` - Extension popup with instructions

## Permissions

The extension only requires "activeTab" permission to work on the current page you're viewing.