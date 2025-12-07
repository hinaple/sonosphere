import { io } from "socket.io-client";
import { get, writable } from "svelte/store";
import { sounds, chains, sequences, storeSetupInfo } from "./stores";
import { downloadEnded, onImportEnded, onImportStarted } from "./projectFile";
import { showToast } from "./toast/toast.svelte";

export const connected = writable(false);
export const url = `${location.hostname}:${import.meta.env.DEV ? 3000 : location.port}`;

const socket = io(url);

export function getSocketId() {
    return socket.id;
}

let closeDisconnectedToast = null;
socket.on("connect", () => {
    socket.emit("editor", (setupInfo) => {
        closeDisconnectedToast?.();
        if (setupInfo.importing) {
            onImportStarted();
            return;
        }
        connected.set(true);
        storeSetupInfo(setupInfo);
    });
});

socket.on("connect_error", () => {
    connected.set(false);
    closeDisconnectedToast = showToast({
        title: "Disconnected from the server.",
        content: "A connection error occurred.",
        duration: 0,
    });
});

socket.on("disconnect", () => {
    connected.set(false);
    closeDisconnectedToast = showToast({
        content: "Disconnected from the server.",
        duration: 0,
    });
});

socket.on("sounds", (soundsArr) => {
    sounds.set(soundsArr);
});

socket.on("project-downloaded", () => {
    downloadEnded();
});

socket.on("import-started", () => {
    onImportStarted();
});
socket.on("import-ended", (setupInfo) => {
    if (!get(connected)) connected.set(true);
    onImportEnded(setupInfo);
});

function importingError() {
    alert("The project is being imported!");
}

export function readyToUpload() {
    return new Promise((res, rej) => {
        socket.emit("ready-to-upload", (result) => {
            if (result.importing) {
                importingError();
                return rej();
            }
            res(result);
        });
    });
}

export function updateSoundsList() {
    return new Promise((res, rej) => {
        socket.emit("refresh-sounds", (result) => {
            if (!result) return res();
            if (result.importing) importingError();
            rej(result);
        });
    });
}

export function requestSoundsList() {
    return new Promise((res, rej) => {
        socket.emit("request-sounds", (result) => {
            if (result.importing) {
                importingError();
                rej();
            } else {
                sounds.set(result.sounds);
                res(result);
            }
        });
    });
}

export function renameSound(originalName, newName) {
    if (originalName === newName.trim()) return;
    return new Promise((res, rej) => {
        socket.emit("rename-sound", originalName, newName.trim(), (err) => {
            if (!err) return res();

            if (err.importing) importingError();
            rej(err);
        });
    });
}
export function deleteSounds(sounds) {
    return new Promise((res, rej) => {
        socket.emit("delete-sounds", sounds, (err) => {
            if (!err) return res();

            if (err.importing) importingError();
            rej(err);
        });
    });
}

export function storeServerData() {
    return new Promise((res, rej) => {
        const data = {
            sequences: get(sequences),
            chains: get(chains),
        };
        console.log("STORING DATA ON SERVER: ", data);
        socket.emit("update-data", data, (err) => {
            if (!err) return res();

            if (err.importing) importingError();
            rej(err);
        });
    });
}

export function executeSequence(sequenceData) {
    socket.emit("execute-sequence", { sequenceData });
}

export function playSequence(sequenceAlias) {
    socket.emit("play", sequenceAlias);
}

export function broadcast(data) {
    socket.emit("broadcast", data);
}
