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
import { advancedBroadcast } from "./server";

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function getNextEntry(map, targetKey) {
    let found = false;
    for (const [key, value] of map) {
        if (found) return [key, value];
        if (key === targetKey) found = true;
    }
    return null;
}

function loadSequence(alias) {
    const targetSequence = getData().sequences.get(alias);
    if (!targetSequence) return;
    targetSequence.works.forEach(({ type, data }) => {
        if (type === "play clip") loadClip(data.file);
        else if (type === "play chain") loadChain(data.chain);
    });
}

export function play(alias) {
    const currentSequence = getData().sequences.get(alias);
    if (!currentSequence) return false;
    executeSequence(currentSequence.works);
    return true;
    // const nextSequence = getNextEntry(getData().sequences, alias);
    // if (!nextSequence || !nextSequence.autoLoad) return;
    // nextSequence.works.forEach(({ type, data }) => {
    //     if (type === "play clip") loadClip(data.file);
    //     else if (type === "play chain") loadChain(data.chain);
    // });
}

const currentWorks = new Map();
export async function executeSequence(sequenceWorks) {
    const sym = Symbol();
    currentWorks.set(sym, true);
    for (let i = 0; i < sequenceWorks.length; i++) {
        if (!currentWorks.get(sym)) break;
        if (sequenceWorks[i].type === "wait")
            await sleep(sequenceWorks[i].data.duration * 1000);
        else executeSingleWork(sequenceWorks[i].type, sequenceWorks[i].data);
    }
    currentWorks.delete(sym);
}

function executeSingleWork(type, data) {
    if (type === "play clip")
        playClip(data.file, data.channel, {
            loop: !!data.loop,
            volume: (data.volume ?? 100) / 100,
        });
    else if (type === "play chain")
        playChain(data.chain, data.from, data.channel, {
            volume: (data.volume ?? 100) / 100,
        });
    else if (type === "play sequence") {
        if (data.alias) play(data.alias);
    } else if (type === "load clip") loadClip(data.file);
    else if (type === "load chain") loadChain(data.chain);
    else if (type === "stop") stop(data.channel);
    else if (type === "fadeout") fadeout(data.channel, data.speed);
    else if (type === "broadcast") advancedBroadcast(data.channel, data.object);
    else if (type === "reset") {
        currentWorks.clear();
        reset();
    }
}
