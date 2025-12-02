import { io } from "socket.io-client";
import { get, writable } from "svelte/store";
import { sounds, editorCount, chains, sequences } from "./stores";

export const connected = writable(false);
export const url = `${location.hostname}:${import.meta.env.DEV ? 3000 : location.port}`;

const socket = io(url);

socket.on("connect", () => {
    socket.emit("editor", (setupInfo) => {
        connected.set(true);
        sounds.set(setupInfo.sounds);
        editorCount.set(setupInfo.editorCount);
        chains.set(setupInfo.data.chains);
        sequences.set(setupInfo.data.sequences);
        console.log("Setup Info: ", setupInfo);
    });
});

socket.on("connect_error", () => {
    connected.set(false);
});

socket.on("disconnect", () => {
    connected.set(false);
});

socket.on("sounds", (soundsArr) => {
    sounds.set(soundsArr);
});

export function updateSoundsList() {
    return new Promise((res) => {
        socket.emit("refresh-sounds", (result) => {
            res(result);
        });
    });
}

export function requestSoundsList() {
    return new Promise((res) => {
        socket.emit("request-sounds", (result) => {
            sounds.set(result);
            res(result);
        });
    });
}

export function renameSound(originalName, newName) {
    if (originalName === newName.trim()) return;
    return new Promise((res, rej) => {
        socket.emit("rename-sound", originalName, newName.trim(), (err) => {
            if (err) rej(err);
            else res();
        });
    });
}
export function deleteSounds(sounds) {
    return new Promise((res, rej) => {
        socket.emit("delete-sounds", sounds, (err) => {
            if (err) rej(err);
            else res();
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
            if (err) rej(err);
            else res();
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
