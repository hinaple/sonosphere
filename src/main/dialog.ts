import {
    dialog,
    MessageBoxOptions,
    OpenDialogOptions,
    SaveDialogOptions,
} from "electron";
import { getWindow } from "./windowUtils";

export function openFile(opt: OpenDialogOptions) {
    const win = getWindow();
    if (!win) return;
    return dialog.showOpenDialog(win, opt);
}

export function saveFile(opt: SaveDialogOptions) {
    const win = getWindow();
    if (!win) return;
    return dialog.showSaveDialog(win, opt);
}

export function messageBox(opt: MessageBoxOptions) {
    const win = getWindow();
    if (!win) return;
    return dialog.showMessageBox(win, opt);
}
