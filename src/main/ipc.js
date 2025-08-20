import { ipcMain } from "electron";
import { getData, SOUNDS_PATH } from "./fileUtils";

ipcMain.handle("request-chain-info", (event, alias) => {
    return getData().chains.get(alias);
});

ipcMain.handle("request-sound-dir", () => {
    return SOUNDS_PATH;
});

ipcMain.on("running", () => {
    console.log("RENDERER IS NOW RUNNING");
});
ipcMain.on("error", (evt, err) => {
    console.error("RENDERER ERROR: ", JSON.stringify(err, null, 4));
});

ipcMain.on("console-log", (evt, log) => {
    console.log("RENDERER LOG: ", log);
});

let window;
export function registerWindow(mainWindow) {
    window = mainWindow;
}

export function playClip(sound, channel, loop) {
    if (!window) return;
    window.webContents.send("play-clip", sound, channel, { loop });
}

export function playChain(sound, from, channel) {
    if (!window) return;
    window.webContents.send("play-chain", sound, from, channel);
}

export function loadClip(url) {
    if (!window) return;
    window.webContents.send("load-clip", url);
}

export function loadChain(alias) {
    if (!window) return;
    window.webContents.send("load-chain", alias, getData().chains.get(alias));
}

export function stop(channel) {
    if (!window) return;
    window.webContents.send("stop", channel);
}
export function fadeout(channel, speed) {
    if (!window) return;
    window.webContents.send("fadeout", channel, speed);
}

export function reset() {
    if (!window) return;
    window.webContents.send("reset");
}
