# Quick Update Instructions for Users

## How to Update GBar Extension

### Method 1: Download Latest Release (Recommended)

1. **Visit the releases page:**
   - Go to: https://github.com/robkaltenbach/goku-bar/releases/latest

2. **Download the latest ZIP:**
   - Click on `GBar-Extension-v1.4.0.zip` (or latest version)
   - Save it somewhere you can find it

3. **Replace your extension:**
   - Extract the ZIP file
   - **Delete your old extension folder** (or rename it)
   - Copy the extracted folder to the same location
   - Make sure the folder contains: `manifest.json`, `content.js`, `toolbar.css`, etc.

4. **Reload in browser:**
   - Open `chrome://extensions` (or `opera://extensions`, `edge://extensions`, `brave://extensions`)
   - Find "GBar - Game Timer Toolbar"
   - Click the reload icon (circular arrow)

### Method 2: Git Pull (For developers/users with git)

If you installed from the git repository:

```bash
cd /path/to/goku-bar
git pull origin main
```

Then reload the extension in your browser.

## Why Manual Updates?

Currently, GBar isn't published on official browser stores, so automatic updates aren't available. However:
- ✅ New versions are clearly marked on GitHub Releases
- ✅ You get the latest features and bug fixes
- ✅ No complicated setup required

**Future:** Once published to Chrome Web Store, Opera Add-ons, or Edge Add-ons, updates will be automatic!

## Check for Updates

The extension version is shown in:
- Settings modal (gear icon → About section)
- Popup window (extension icon in toolbar)

Current version: **v1.4.0**

