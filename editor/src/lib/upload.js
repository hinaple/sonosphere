import pLimit from "p-limit";
import { url } from "./socket.js";

export function selectFiles({ multi = false, accept = [] } = {}) {
    return new Promise((res) => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = multi;
        input.accept = accept.join(",");
        input.style.display = "none";
        input.addEventListener("input", async () => {
            res(Array.from(input.files));
        });
        input.addEventListener("cancel", () => {
            res([]);
        });
        document.body.append(input);
        input.click();
        document.body.removeChild(input);
    });
}

const MAX_FILE_PER_REQUEST = 3;
const limit = pLimit(2);
export function uploadLimittedSounds(files) {
    if (files.length <= MAX_FILE_PER_REQUEST) return uploadSoundRequest(files);
    const batches = [];
    for (let i = 0; i < files.length; i += MAX_FILE_PER_REQUEST) {
        batches.push(files.slice(i, i + MAX_FILE_PER_REQUEST));
    }
    const uploadTasks = batches.map((f) => limit(() => uploadSoundRequest(f)));
    return Promise.all(uploadTasks);
}

function uploadSoundRequest(files) {
    const FD = new FormData();
    files.forEach((file) => FD.append("files", file));
    return fetch(`http://${url}/sounds`, {
        method: "POST",
        body: FD,
    });
}

export async function uploadProject(projectFile, confirmKey) {
    return fetch(`http://${url}/project`, {
        method: "POST",
        body: projectFile,
        headers: {
            "confirm-key": confirmKey,
        },
    });
}
