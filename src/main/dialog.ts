import {
    BrowserWindow,
    dialog,
    MessageBoxOptions,
    OpenDialogOptions,
    SaveDialogOptions,
} from "electron";

let window: BrowserWindow | null = null;

export function setDialogWindow(win: BrowserWindow | null) {
    window = win;
}

export function openFile(opt: OpenDialogOptions) {
    if (!window) return;
    return dialog.showOpenDialog(window, opt);
}

export function saveFile(opt: SaveDialogOptions) {
    if (!window) return;
    return dialog.showSaveDialog(window, opt);
}

export function messageBox(opt: MessageBoxOptions) {
    if (!window) return;
    return dialog.showMessageBox(opt);
}
