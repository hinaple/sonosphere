import { ipcRenderer } from "electron";
import AudioClip from "./lib/audio/audioClip";
import AudioChain from "./lib/audio/audioChain";

let clips = new Map();
let chains = new Map();
let channels = new Map();
ipcRenderer.on("reset", () => {
    clips.forEach((v) => v.unload(false));
    chains.forEach((v) => v.unload(false));
    clips = new Map();
    chains = new Map();
    channels = new Map();
});
function unloadHandler(type, url) {
    (type === "clip" ? clips : chains).delete(url);
}
function registerClip(url) {
    const clip = clips.get(url);
    if (clip) return clip;
    const tempClip = new AudioClip(url, {
        onunload: () => unloadHandler("clip", url),
    });
    clips.set(url, tempClip);
    return tempClip;
}
async function registerChain(alias, segmentsArr = null) {
    const chain = chains.get(alias);
    if (chain) return chain;
    if (!segmentsArr)
        segmentsArr = await ipcRenderer.invoke("request-chain-info", alias);
    const tempChain = new AudioChain(segmentsArr, {
        onunload: () => unloadHandler("chain", alias),
    });
    chains.set(alias, tempChain);
    return tempChain;
}
ipcRenderer.on("load-clip", (evt, url) => {
    registerClip(url).load();
});
ipcRenderer.on("load-chain", async (evt, alias, segmentsArr) => {
    (await registerChain(alias, segmentsArr)).readyNext();
});
function unloadChannel(channel) {
    channels.get(channel)?.unload?.(true);
}
ipcRenderer.on(
    "play-clip",
    (evt, sound, channel = "default", { loop = false } = {}) => {
        const clip = registerClip(sound);
        unloadChannel(channel);
        channels.set(channel, clip);
        clip.play({ loop });
    }
);
ipcRenderer.on("play-chain", async (evt, sound, from, channel = "default") => {
    const chain = await registerChain(sound);
    if (channels.get(channel) !== chain) {
        unloadChannel(channel);
        channels.set(channel, chain);
    }
    chain.startPlaying(from);
});
ipcRenderer.on("stop", (evt, channel) => {
    const sound = channels.get(channel);
    if (!sound) return;
    sound.stop();
});
ipcRenderer.on("fadeout", (evt, channel, speed) => {
    const sound = channels.get(channel);
    if (!sound) return;
    sound.fadeOut(speed);
});
