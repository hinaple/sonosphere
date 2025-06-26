import { io } from "socket.io-client";
import { writable } from "svelte/store";
import { sounds, editorCount } from "./stores";

export const connected = writable(false);
export const url = import.meta.env.DEV ? "localhost:80" : location.hostname;

const socket = io(url);

socket.on("connect", () => {
    connected.set(true);
    socket.emit("editor", (setupInfo) => {
        sounds.set(setupInfo.sounds);
        editorCount.set(setupInfo.editorCount);
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
