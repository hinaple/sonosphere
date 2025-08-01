import { getData } from "./fileUtils";
import {
    fadeout,
    loadChain,
    loadClip,
    playChain,
    playClip,
    reset,
    stop,
} from "./ipc";

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function getNextEntry(map, targetKey) {
    let found = false;
    for (const [key, value] of map) {
        if (found) return [key, value];
        if (key === targetKey) found = true;
    }
    return null;
}

export function play(alias) {
    const currentSequence = getData().sequences.get(alias);
    if (!currentSequence) return;
    executeSequence(currentSequence.works);
    // const nextSequence = getNextEntry(getData().sequences, alias);
    // if (!nextSequence || !nextSequence.autoLoad) return;
    // nextSequence.works.forEach(({ type, data }) => {
    //     if (type === "play clip") loadClip(data.file);
    //     else if (type === "play chain") loadChain(data.chain);
    // });
}

export async function executeSequence(sequenceWorks) {
    for (let i = 0; i < sequenceWorks.length; i++) {
        if (sequenceWorks[i].type === "wait")
            await sleep(sequenceWorks[i].data.duration * 1000);
        else executeSingleWork(sequenceWorks[i].type, sequenceWorks[i].data);
    }
}

function executeSingleWork(type, data) {
    if (type === "play clip") playClip(data.file, data.channel, !!data.loop);
    else if (type === "play chain")
        playChain(data.chain, data.from, data.channel);
    else if (type === "load clip") loadClip(data.file);
    else if (type === "load chain") loadChain(data.chain);
    else if (type === "stop") stop(data.channel);
    else if (type === "fadeout") fadeout(data.channel, data.speed);
    else if (type === "reset") reset();
}
