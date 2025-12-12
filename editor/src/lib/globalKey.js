import { get } from "svelte/store";
import { unsaved } from "./stores";
import { storeServerData } from "./socket";
import { doBlockJob } from "./blockManager";
import download from "./download";
import { tryToDownloadProject, tryToUploadProject } from "./projectFile";
import { showToast } from "./toast/toast.svelte.js";

async function pressedCtrlShiftKey(key) {
    if (key === "s") {
        tryToDownloadProject();
    } else if (key === "o") {
        tryToUploadProject();
    }
}

function pressedCtrlKey(key) {
    if (key === "s") {
        storeServerData()
            .then(() => {
                unsaved.set(false);
                showToast({
                    content: "Data saved successfully.",
                    duration: 700,
                });
            })
            .catch((err) => {
                alert("An error occurred while storing data on the server.");
                console.error(err);
            });
        return true;
    } else if (key === "f") return doBlockJob("search");

    return false;
}

export function executeShortcut({
    metaKey = false,
    ctrlKey = false,
    shiftKey = false,
    key,
}) {
    key = key.toLowerCase();
    if (key === "delete") return doBlockJob("delete");
    else if ((metaKey || ctrlKey) && shiftKey) return pressedCtrlShiftKey(key);
    else if (metaKey || ctrlKey) return pressedCtrlKey(key);

    return false;
}

window.addEventListener(
    "keydown",
    (evt) => {
        if (executeShortcut(evt)) evt.preventDefault();
    },
    true
);
