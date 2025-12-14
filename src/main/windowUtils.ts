import { BrowserWindow } from "electron";

let window: BrowserWindow | null = null;
export function setWindow(win: BrowserWindow) {
    window = win;
}

export function getWindow() {
    return window;
}

export function focusWindow() {
    if (!window) return;
    window.focus();
}
