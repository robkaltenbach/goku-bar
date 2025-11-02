# Auto-Update Setup Guide

This guide explains how to set up automatic updates for GBar Extension using GitHub Releases.

## For Users

### Initial Installation
1. Go to the [Latest Release](https://github.com/robkaltenbach/goku-bar/releases/latest)
2. Download `GBar-Extension-v1.4.0.zip` (or latest version)
3. Extract the ZIP file
4. Load as unpacked extension in your browser

### Auto-Update Option (Chrome/Edge/Brave)
For automatic updates, you can install the extension via the update URL:

1. **Get Extension ID:**
   - Load the extension as unpacked
   - Go to `chrome://extensions` (or `edge://extensions`, `brave://extensions`)
   - Enable "Developer mode"
   - Note the Extension ID (shown below the extension name)

2. **Update the manifest** (one-time setup):
   - Open `manifest.json` in the extension folder
   - Add this before the closing brace (replace YOUR_EXTENSION_ID):
   ```json
   "update_url": "https://raw.githubusercontent.com/robkaltenbach/goku-bar/main/update-manifest.xml"
   ```
   - Reload the extension

3. **Browser will check for updates automatically** every few hours

## For Developers

### Publishing Updates via GitHub Releases

1. **Update version number:**
   ```bash
   # Update in these files:
   - manifest.json (version field)
   - content.js (Version display in settings)
   - popup.html (version in footer)
   ```

2. **Create and push a git tag:**
   ```bash
   git tag v1.4.0
   git push origin v1.4.0
   ```

3. **GitHub Actions will automatically:**
   - Create a release
   - Build the ZIP file
   - Attach it to the release

4. **Update the manifest file** (if using update_url):
   - Update `update-manifest.xml` with new version
   - Commit and push to main branch

### Manual Release (Alternative)

If GitHub Actions isn't working:

1. Create ZIP file:
   ```bash
   zip -r GBar-Extension-v1.4.0.zip \
     content.js manifest.json popup.html toolbar.css \
     icon16.png icon48.png icon128.png \
     -x "*.zip" "*.git*" "ext/*"
   ```

2. Go to GitHub Releases: https://github.com/robkaltenbach/goku-bar/releases/new

3. Create new release:
   - Tag: `v1.4.0`
   - Title: `GBar Extension v1.4.0`
   - Upload the ZIP file
   - Publish release

## Notes

- **Unpacked extensions** (developer mode) don't auto-update - users need to manually reload
- **Update URL method** works but requires users to modify manifest.json
- **Best solution**: Publish to official stores (Chrome Web Store, Opera Add-ons, Edge Add-ons) for true auto-updates
- **Current workaround**: Use GitHub Releases - users download latest ZIP and replace folder

## Recommended Approach

For now, the easiest solution for users:
1. Bookmark the releases page: https://github.com/robkaltenbach/goku-bar/releases
2. When you see a new version, download the latest ZIP
3. Replace the extension folder with the new version
4. Reload the extension in browser

This is manual but reliable until the extension is published to official stores.

