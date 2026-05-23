# Al-Hasan & Al-Hussein Library - Desktop App

## Quick Start (Development)

```bash
npm install
npm start
```

## Build Desktop App

### Option 1: Packaged App (Recommended)
```bash
npm run pack
```
Output: `build-output\Al-Hasan & Al-Hussein Library-win32-x64\`

### Option 2: Create Installer
Run the batch installer:
```
install.bat
```
This copies the app to `Program Files` and creates desktop/start menu shortcuts.

### Option 3: Professional Installer (Inno Setup)
1. Download Inno Setup: https://jrsoftware.org/isdl.php
2. Run: `"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" installer.iss`
3. Output: `installer-output\Al-Hasan-Library-Setup.exe`

## Icon Setup

Place a 256x256 PNG file as `build/icon.png`, then convert:
```bash
node create-icon.js
```

## Project Structure

```
library-system/
├── main.js              # Electron main process
├── preload.js           # Preload script (security)
├── package.json         # Dependencies & build config
├── index.html           # Entry point
├── *.html               # All pages
├── css/                 # Stylesheets
├── js/                  # JavaScript modules
├── data/               # Seed data
├── build/              # Build assets (icon.ico)
├── build-output/       # Packaged app (generated)
├── install.bat         # Simple Windows installer
├── installer.iss       # Inno Setup script
└── create-icon.js      # Icon generator
```

## Features

- Fully offline desktop application
- Windows executable with custom icon
- ASAR packaged for code protection
- Professional POS/ERP desktop experience
- Auto-updates localStorage data persistence
- Session auto-logout on browser close

## Commands

| Command | Description |
|---------|-------------|
| `npm start` | Run in development mode |
| `npm run pack` | Create packaged desktop app |
| `npm run build` | Build NSIS installer (requires admin) |
