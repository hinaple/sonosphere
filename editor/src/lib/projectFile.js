import { get, writable } from "svelte/store";
import { getSocketId, readyToUpload } from "./socket";
import { showToast } from "./toast/toast.svelte";
import { selectFiles, uploadProject } from "./upload";
import { storeSetupInfo } from "./stores";
import download from "./download";
import { getHttpUrl } from "./utils";

let onProjectDownloaded = null;

export function tryToDownloadProject() {
    if (onProjectDownloaded) return;

    showToast({
        content: "Creating Sonosphere project file...",
        duration: 0,
    });
    downloadProjectFile()
        .then(([already, message]) => {
            if (already) return;

            showToast({
                content: message || "A project file created.",
                duration: 1000,
            });
        })
        .catch((err) => {
            showToast({
                title: "Error!",
                content: "An error occurred while creating project file.",
                duration: 1000,
            });
            console.error(err);
        });
}

function downloadProjectFile() {
    return new Promise((res, rej) => {
        if (onProjectDownloaded) return res([true, null]);
        onProjectDownloaded = res;
        try {
            download(
                `${getHttpUrl()}/project?id=${getSocketId()}`,
                "sonosphere.snpp"
            );
        } catch (e) {
            rej(e);
            onProjectDownloaded = null;
        }
    });
}

export function downloadEnded(message) {
    if (!onProjectDownloaded) return;
    onProjectDownloaded([false, message]);
    onProjectDownloaded = null;
}

export const importing = writable(false);

export async function tryToUploadProject() {
    const readyData = await readyToUpload();
    showToast({
        title: "Importing project",
        content:
            "Are you sure to import a new project?\n" +
            "This will overwrite the current project data and cannot be undone." +
            (readyData.editorCount > 1
                ? `\nThere are currently ${readyData.editorCount} editors clients connected.`
                : ""),
        btns: [
            {
                label: "Confirm",
                classes: "confirm",
                onclick: () => {
                    selectAndUploadProject(readyData.confirmKey);
                    return true;
                },
            },
            { label: "Cancel", onclick: () => true },
        ],
        duration: readyData.autoCancelMs,
    });
}

async function selectAndUploadProject(key) {
    const files = await selectFiles({ accept: [".snpp"] });
    if (files.length !== 1) return;

    importing.set(true);
    showToast({
        content: "Uploading the project file...",
        duration: 0,
    });
    uploadProject(files[0], key)
        .then((result) => {
            if (result.status === 200) {
                showToast({
                    content: "Uploaded the Sonosphere project file.",
                    duration: 2000,
                });
                return;
            }
            showToast({
                title: "Failed to upload",
                content:
                    result.status === 403
                        ? "Your request has timed out or your access is invalid."
                        : "Something went wrong.",
            });
            importing.set(false);
        })
        .catch((err) => {
            showToast({
                title: "Error!",
                content: "An error occurred while uploading new project file.",
            });
            console.error(err);
        });
}

export function onImportStarted() {
    if (get(importing)) return;
    importing.set(true);
    showToast({
        content: "Importing a new project...",
        duration: 0,
    });
}

export function onImportEnded(setupInfo) {
    console.log("IMPORT END");
    importing.set(false);
    showToast({
        content: "A new project file imported.",
        duration: 2000,
    });
    storeSetupInfo(setupInfo);
}
