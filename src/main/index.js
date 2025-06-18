import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { electronApp, is } from "@electron-toolkit/utils";
import "./server.js";

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 300,
        height: 200,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            sandbox: false,
            webSecurity: false,
            allowRunningInsecureContent: true,
        },
    });

    mainWindow.on("ready-to-show", () => {
        mainWindow.show();
    });

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url);
        return { action: "deny" };
    });

    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
        mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    } else {
        mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
    }
}

app.whenReady().then(() => {
    electronApp.setAppUserModelId("com.beyondspace.sonosphere");

    createWindow();

    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
