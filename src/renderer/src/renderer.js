import { ipcRenderer } from "electron";
import AudioClip from "./lib/audio/audioClip";
import AudioChain from "./lib/audio/audioChain";

let clips = new Map();
let chains = new Map();
let channels = new Map();
ipcRenderer.on("init", (evt, clipsData, chainsData) => {
    channels = new Map();
    clips = new Map(clipsData.map((url) => [url, new AudioClip(url)]));
    chains = new Map(
        Object.entries(chainsData).map(([key, value]) => [
            key,
            new AudioChain(
                value.map((seg) => ({ clip: clips.get(seg.url), ...seg }))
            ),
        ])
    );
});
ipcRenderer.on("load", (evt, type, sound) => {
    (type === "clip" ? clips : chains).get(sound)?.load?.();
});
function unloadChannel(channel) {
    channels.get(channel)?.unload?.();
}
ipcRenderer.on("playClip", (evt, sound, channel = "default") => {
    const clip = clips.get(sound);
    if (!clip) return;

    unloadChannel(channel);
    channels.set(channel, clip);
    clip.play();
});
ipcRenderer.on("playChain", (evt, sound, from, channel = "default") => {
    const chain = chains.get(sound);
    if (!chain) return;

    unloadChannel(channel);
    channels.set(channel, chain);
    chain.startPlaying(from);
});
