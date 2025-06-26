import pLimit from "p-limit";
import { url } from "./socket";

export function selectAndUploadSounds() {
    return new Promise((res) => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.accept = ".mp3,.ogg,.wav,.opus,.webm";
        input.style.display = "none";
        input.addEventListener("input", async () => {
            res(await uploadLimittedSounds(Array.from(input.files)));
        });
        input.addEventListener("cancel", () => {
            res(false);
        });
        document.body.append(input);
        input.click();
        document.body.removeChild(input);
    });
}

const MAX_FILE_PER_REQUEST = 3;
const limit = pLimit(2);
export function uploadLimittedSounds(files) {
    if (files.length <= MAX_FILE_PER_REQUEST) return uploadRequest(files);
    const batches = [];
    for (let i = 0; i < files.length; i += MAX_FILE_PER_REQUEST) {
        batches.push(files.slice(i, i + MAX_FILE_PER_REQUEST));
    }
    const uploadTasks = batches.map((f) => limit(() => uploadRequest(f)));
    return Promise.all(uploadTasks);
}

function uploadRequest(files) {
    const FD = new FormData();
    files.forEach((file) => FD.append("files", file));
    return fetch(`http://${url}/sounds`, {
        method: "POST",
        body: FD,
    });
}
