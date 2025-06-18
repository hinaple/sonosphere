import fs from "fs/promises";
import path from "path";
import { app } from "electron";

export const EDITOR_PATH = app.isPackaged
    ? path.join(__dirname, "../../public/editor")
    : path.join(app.getAppPath(), "public/editor");

export const PROJECT_PATH = path.join(app.getPath("userData"), "project");
export const SOUNDS_PATH = path.join(PROJECT_PATH, "sounds");

const DATA_FILE_PATH = path.join(PROJECT_PATH, "sonosphere-data.json");

let sounds = [];

export function getSounds() {
    return sounds;
}
export async function updateSounds() {
    sounds = await fs.readdir(SOUNDS_PATH);
    return sounds;
}

let data = {};
export function storeData(newData) {
    data = newData;
    fs.writeFile(DATA_FILE_PATH, JSON.stringify(data), "utf-8");
}
export function getData() {
    return data;
}
export async function getDataFile() {
    try {
        data = await fs.readFile(DATA_FILE_PATH, "utf-8");
        return data;
    } catch (err) {
        if (err.code === "ENOENT") {
            console.log("CREATING DATA FILE");
            storeData({});
            return {};
        } else throw err;
    }
}

export function renameSound(originalName, newName) {
    return fs.rename(
        path.join(SOUNDS_PATH, originalName),
        path.join(SOUNDS_PATH, newName)
    );
}

export function deleteSounds(sounds = []) {
    return Promise.all(sounds.map((s) => fs.unlink(path.join(SOUNDS_PATH, s))));
}

fs.mkdir(SOUNDS_PATH, { recursive: true }).then(updateSounds).then(getDataFile);
