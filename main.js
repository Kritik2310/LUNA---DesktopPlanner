const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    resizable: true,
    title: 'Luna - Crescent moons, cozy tunes and calm plans',
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });
  win.loadFile('views/splash.html');
}
app.whenReady().then(() => {
  createWindow();
});
