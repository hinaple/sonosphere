import { ipcMain } from "electron";
import { getData, SOUNDS_PATH } from "./fileUtils";
import { getWindow } from "./windowUtils";

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

export function playClip(sound, channel, { loop, volume }) {
    if (!getWindow()) return;
    getWindow().webContents.send("play-clip", sound, channel, { loop, volume });
}

export function playChain(sound, from, channel, { volume }) {
    if (!getWindow()) return;
    getWindow().webContents.send("play-chain", sound, from, channel, {
        volume,
    });
}

export function loadClip(url) {
    if (!getWindow()) return;
    getWindow().webContents.send("load-clip", url);
}

export function loadChain(alias) {
    if (!getWindow()) return;
    getWindow().webContents.send(
        "load-chain",
        alias,
        getData().chains.get(alias)
    );
}

export function stop(channel) {
    if (!getWindow()) return;
    getWindow().webContents.send("stop", channel);
}
export function fadeout(channel, speed) {
    if (!getWindow()) return;
    getWindow().webContents.send("fadeout", channel, speed);
}

export function reset() {
    if (!getWindow()) return;
    getWindow().webContents.send("reset");
}

function sendNativeEditor(type, ...args) {
    if (!getWindow()) return;
    getWindow().webContents.send("pass-editor", type, ...args);
}
export function confirmImport(filepath) {
    if (!getWindow()) return;
    sendNativeEditor("confirm-import", filepath);
}
