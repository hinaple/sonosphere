import fs from "fs/promises";
import path from "path";
import { app } from "electron";
import ServerData from "./lib/ServerData";
import { onImportEnded, onImportStart, openSocketServer } from "./server";
import SnppManager from "./snppManager";

export const EDITOR_PATH = app.isPackaged
    ? path.join(app.getAppPath(), "../../public/editor")
    : path.join(app.getAppPath(), "public/editor");

export const PROJECT_PATH = path.join(app.getPath("userData"), "project");
export const SOUNDS_PATH = path.join(PROJECT_PATH, "sounds");

const DATA_FILE_PATH = path.join(PROJECT_PATH, "sonosphere-data.json");

let sounds = null;
let soundsLoadingPromise = null;

export function getSounds() {
    if (soundsLoadingPromise) return soundsLoadingPromise;
    return sounds;
}
function isSoundListChanged(nowSounds) {
    if (nowSounds.length !== sounds.length) return true;
    return nowSounds.some((s, i) => sounds[i] !== s);
}
export function updateSounds() {
    if (soundsLoadingPromise) return soundsLoadingPromise;
    return (soundsLoadingPromise = new Promise(async (res) => {
        const tempSounds = await fs.readdir(SOUNDS_PATH, "utf-8");
        soundsLoadingPromise = null;
        if (data && sounds && isSoundListChanged(tempSounds))
            data.renewVersion();
        sounds = tempSounds;
        res(sounds);
        soundsLoadingPromise = null;
    }));
}

/** @type { ServerData | null } */
let data = null;
export async function storeData(newData) {
    data = new ServerData(newData, true);
    const stringData = data.storeData;
    await fs.writeFile(DATA_FILE_PATH, stringData, "utf-8");
}
export function getData() {
    return data;
}
export function getArrayData() {
    return data.arrayData;
}
export async function getDataFile() {
    try {
        data = new ServerData(
            JSON.parse(await fs.readFile(DATA_FILE_PATH, "utf-8"))
        );
    } catch (err) {
        if (err.code === "ENOENT") {
            console.log("CREATING DATA FILE");
            storeData({});
        } else throw err;
    }
    return data;
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

const snpp = new SnppManager({
    projectDir: PROJECT_PATH,
    beforeImport: onImportStart,
    afterImport: async () => {
        Promise.all([updateSounds(), getDataFile()]);
        onImportEnded();
    },
});

export function snppCreateStream() {
    return snpp.createStream();
}
export function snppExtractStream() {
    if (snpp.importing) return null;
    return snpp.extractStream();
}
export const isImporting = () => snpp.importing;

fs.mkdir(SOUNDS_PATH, { recursive: true })
    .then(updateSounds)
    .then(getDataFile)
    .then(openSocketServer);
