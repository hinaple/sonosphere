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

export function unregisterBlock(blockName) {
    const temp = blocks[blockName];
    if (!temp) return;
    // temp.blurCb();
    delete blocks[blockName];
}

export function block(node, { name, jobs = {} }) {
    registerBlock(
        name,
        jobs,
        () => node.classList.add("focus"),
        () => node.classList.remove("focus")
    );
    const mousedown = () => workAt(name);
    node.addEventListener("mousedown", mousedown, true);

    return {
        destroy() {
            node.removeEventListener("mousedown", mousedown, true);
            unregisterBlock(name);
        },
    };
}

window.addEventListener("keydown", (evt) => {
    if (!workingBlock || !blocks[workingBlock]) return;
    const current = blocks[workingBlock].jobs;
    if (evt.key === "Delete" && current.delete) return current.delete();
});
