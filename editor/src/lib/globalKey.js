import { get } from "svelte/store";
import { unsaved } from "./stores";
import { storeServerData } from "./socket";
import { doBlockJob } from "./blockManager";

function ctrlKey(key) {
    if (key === "s") {
        storeServerData()
            .then(() => {
                unsaved.set(false);
            })
            .catch((err) => {
                alert("An error occurred while storing data on the server.");
                console.error(err);
            });
        return true;
    } else if (key === "f") return doBlockJob("search");

    return false;
}

window.addEventListener(
    "keydown",
    (evt) => {
        const key = evt.key.toLowerCase();
        let result = false;
        if (key === "delete") result = doBlockJob("delete");
        else if (evt.ctrlKey) result = ctrlKey(key);

        if (result) evt.preventDefault();
    },
    true
);
