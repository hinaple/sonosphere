import fs from "fs/promises";
import path, { join } from "path";
import { app } from "electron";
import ServerData from "./lib/ServerData";
import { onImportEnded, onImportStart, openSocketServer } from "./server";
import SnppManager from "./snppManager";
import { openFile, saveFile } from "./dialog";
import { createReadStream, createWriteStream } from "fs";
import { focusWindow } from "./windowUtils";

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
        await Promise.all([updateSounds(), getDataFile()]);
        onImportEnded();
        if (process.platform === "win32") {
            focusWindow();
        }
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

export function nativeSelectProject() {
    if (snpp.importing) return { canceled: true };
    return openFile({
        title: "Select Sonosphere project file",
        defaultPath: app.getPath("documents"),
        filters: [{ name: "Sonosphere Project", extensions: ["snpp"] }],
    });
}
export function nativeSetSavePath(filename = "sonosphere.snpp") {
    if (snpp.importing) return { canceled: true };
    return saveFile({
        title: "Exporting Sonosphere project file",
        defaultPath: join(app.getPath("documents"), filename),
        filters: [{ name: "Sonosphere Project", extensions: ["snpp"] }],
    });
}
export function nativeProjectImport(filepath) {
    return new Promise(async (res, rej) => {
        if (snpp.importing) return rej("already importing");
        console.log("Importing local project", filepath);
        const stream = await snppExtractStream();
        if (!stream) return;
        createReadStream(filepath)
            .pipe(stream)
            .on("finish", () => {
                console.log("Imported Local File.");
                res();
            })
            .on("error", (err) => {
                console.log("Importing Local File Error: ", err);
                rej(err);
            });
    });
}
export function nativeProjectSave(filepath) {
    return new Promise((res, rej) => {
        if (snpp.importing) return rej();
        snppCreateStream()
            .pipe(createWriteStream(filepath))
            .on("finish", () => {
                res(filepath);
            })
            .on("error", rej);
    });
}

fs.mkdir(SOUNDS_PATH, { recursive: true })
    .then(updateSounds)
    .then(getDataFile)
    .then(openSocketServer);
