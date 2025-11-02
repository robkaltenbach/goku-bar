# GBar - Game Timer Toolbar

A minimal timer toolbar for web browsers with game-specific presets. Clean, understated design perfect for gaming sessions.

## ✨ Features

- **Game Timers**: Quick access buttons (Whack, Mug, Flight, Train, Scavenge, Old Man, Custom)
- **Visual Alerts**: Red flash when timer completes
- **Audio Alerts**: Low-tone "ding ding ding" when timer completes
- **Collapsible**: Hide/show toolbar without losing your timers
- **Multiple Timers**: Run all timers simultaneously
- **Persistent Timers**: Timers continue across page loads
- **Custom Timer**: Set any duration from 1-999 seconds

## 🌐 Browser Compatibility

This extension works seamlessly in:
- ✅ **Opera** (Chromium-based)
- ✅ **Chrome**
- ✅ **Microsoft Edge**
- ✅ **Brave**
- ✅ **Vivaldi**

## 📦 Installation

### Opera / Chrome / Edge / Brave

1. **Download this extension**
   - Clone or download this repository
   - Extract to a folder on your computer

2. **Create Icon Files**
   - Create three PNG files: `icon16.png`, `icon48.png`, `icon128.png`
   - You can use any timer/clock icon or create simple colored squares
   - Place them in the extension root folder

3. **Load the Extension**
   - Open your browser and navigate to:
     - **Opera**: `opera://extensions`
     - **Chrome**: `chrome://extensions`
     - **Edge**: `edge://extensions`
     - **Brave**: `brave://extensions`
   
4. **Enable Developer Mode**
   - Toggle "Developer mode" switch (usually top-right corner)
   
5. **Load Unpacked Extension**
   - Click "Load unpacked" button
   - Select the extension folder
   - The extension should now appear in your extensions list

6. **Test It Out**
   - Visit `mafia.org` or `www.mafia.org`
   - You should see the GBar toolbar at the top

## 🎮 How to Use

1. **Navigate**: Left-click any preset button to go to that game page
2. **Start Timer**: Right-click any preset button to start/restart its timer
3. **Custom Timer**: Left-click "Custom" to open input box, right-click to start timer
4. **Multiple Timers**: All timers can run simultaneously
5. **Sound**: Click the sound icon to toggle audio alerts
6. **Hide**: Click "X" to collapse the toolbar (click "◀" to expand)
7. **Settings**: Click the gear icon for customization options

## 🎨 Customization

The settings panel allows you to:
- Change toolbar text color
- View extension information
- Access contact links

## 📝 File Structure

```
gbar-extension/
├── manifest.json       # Extension configuration
├── content.js          # Timer logic and toolbar injection
├── toolbar.css         # Toolbar styling
├── popup.html          # Extension popup (info page)
├── icon16.png          # Small icon (16x16)
├── icon48.png          # Medium icon (48x48)
├── icon128.png         # Large icon (128x128)
└── README.md           # This file
```

## 🚀 Publishing

### Opera Add-ons
1. Create account at [Opera Add-ons](https://addons.opera.com/developer/)
2. Upload extension as ZIP
3. Fill in details and submit for review

### Chrome Web Store
1. Create account at [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devcenter/)
2. Pay one-time $5 registration fee
3. Upload ZIP and publish

### Edge Add-ons
1. Register at [Microsoft Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/)
2. Upload extension
3. Submit for certification

## 📄 License

Free to use and modify for personal and commercial projects.

## 🤝 Contributing

Feel free to fork, modify, and improve this extension!

---

**By robkaltenbach / Transistor 2025**