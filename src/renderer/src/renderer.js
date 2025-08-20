import { ipcRenderer } from "electron";
import AudioClip from "./lib/audio/audioClip";
import AudioChain from "./lib/audio/audioChain";

let clips = new Map();
let chains = new Map();
let channels = new Map();

ipcRenderer.send("running");

const Context = new AudioContext();

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
        context: Context,
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
        context: Context,
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

window.onerror = (msg, source, lineno, colno, err) => {
    ipcRenderer.send("error", {
        msg,
        source,
        lineno,
        colno,
        stack: err.stack ?? null,
    });
};

window.addEventListener("unhandledrejection", (evt) => {
    ipcRenderer.send(
        "error",
        evt.reason
            ? {
                  message: evt.reason?.message,
                  stack: evt.reason?.stack,
                  name: evt.reason?.name,
              }
            : "Unknown error"
    );
});

function makeNoisySilence() {
    const s = Context.createBufferSource();
    s.buffer = Context.createBuffer(1, Context.sampleRate, Context.sampleRate);
    const data = s.buffer.getChannelData(0);

    const Freq = 30;
    const samplePerCycle = Context.sampleRate / Freq;

    for (let i = 0; i < data.length; i++) {
        data[i] = i % samplePerCycle < samplePerCycle / 2 ? 1 : -1;
    }
    s.loop = true;

    const gainNode = Context.createGain();
    gainNode.gain.value = 0.001;
    s.connect(gainNode).connect(Context.destination);
    s.start();
}
makeNoisySilence();
