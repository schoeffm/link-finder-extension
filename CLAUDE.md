# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Microsoft Edge browser extension that implements type-ahead find functionality for links on web pages. Users press `/` to activate search mode and type to find matching links on the current page.

## Architecture

- **Extension Type**: Manifest V3 browser extension for Microsoft Edge
- **Core Components**:
  - `content.js`: Main functionality implemented as a TypeAheadFind class that handles keyboard events, search UI, link matching, and navigation
  - `styles.css`: Styling for the search overlay UI and link highlighting
  - `popup.html`: Extension popup with usage instructions
  - `manifest.json`: Extension configuration with minimal permissions (activeTab only)

## Key Technical Details

- **Search Implementation**: Case-insensitive substring matching against both link text content and href URLs
- **UI Pattern**: Fixed-position overlay search box with real-time match counter
- **Event Handling**: Global keydown/keyup listeners with proper input field detection to avoid conflicts
- **Link Navigation**: Circular selection with keyboard shortcuts (arrows, tab/shift-tab)
- **Styling Approach**: CSS classes applied dynamically (typeahead-match, typeahead-selected) with high z-index overlay

## Development Commands

- **Package Extension**: `./package.sh` - Creates dist/ directory and generates type-ahead-find-extension.zip for distribution
- **Test Locally**: Load unpacked extension from project root in edge://extensions/ with developer mode enabled

## File Structure

- Core extension files: manifest.json, content.js, styles.css, popup.html
- Icons: icon16.png, icon48.png, icon128.png
- Development tools: package.sh, create-icons.html, test.html
- Documentation: README.md