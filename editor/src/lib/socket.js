import { io } from "socket.io-client";
import { writable } from "svelte/store";

export const connected = writable(false);

const socket = io(import.meta.env.DEV ? "localhost" : location.hostname);

socket.on("connect", () => {
    connected.set(true);
    socket.emit("editor", (howMany) => {
        console.log("CURRENT EDITOR COUNT: ", howMany);
    });
});

socket.on("connect_error", () => {
    connected.set(false);
});

socket.on("disconnect", () => {
    connected.set(false);
});
