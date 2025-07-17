// import { get, writable } from "svelte/store";

let workingBlock = null;

const blocks = {};
export function workAt(block) {
    workingBlock = block;
    Object.entries(blocks).forEach(([key, jobs]) => {
        if (key === block) jobs.focusCb?.();
        else jobs.blurCb?.();
    });
}
export function registerBlock(blockName, jobs, focusCb, blurCb) {
    blurCb();
    blocks[blockName] = { jobs, focusCb, blurCb };
}

export function block(node, { name, jobs = {} }) {
    registerBlock(
        name,
        jobs,
        () => node.classList.remove("blur"),
        () => node.classList.add("blur")
    );
    node.addEventListener("mousedown", () => workAt(name), true);
}

window.addEventListener("keydown", (evt) => {
    if (!workingBlock || !blocks[workingBlock]) return;
    const current = blocks[workingBlock].jobs;
    if (evt.key === "Delete" && current.delete) return current.delete();
});
