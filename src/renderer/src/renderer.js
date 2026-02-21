import { ipcRenderer } from "electron";
import AudioClip from "./lib/audio/audioClip";
import AudioChain from "./lib/audio/audioChain";

let clips = new Map();
let chains = new Map();
let channels = new Map();

ipcRenderer.send("running");

const Context = new AudioContext();

let editorIframe = null;
let editorOrigin = null;
ipcRenderer.on("native-editor", (evt, { editorPort, nativeAuthKey }) => {
    if (editorIframe) return;

    editorIframe = document.createElement("iframe");
    editorOrigin = `http://localhost:${editorPort ?? 3000}`;
    editorIframe.src = editorOrigin;
    editorIframe.width = "100%";
    editorIframe.height = "100%";
    editorIframe.allowFullscreen = true;
    editorIframe.sandbox = [
        "downloads",
        "forms",
        "modals",
        "orientation-lock",
        "pointer-lock",
        "popups",
        "popups-to-escape-sandbox",
        "presentation",
        "same-origin",
        "scripts",
        "top-navigation",
        "top-navigation-by-user-activation",
        "top-navigation-to-custom-protocols",
    ]
        .map((v) => "allow-" + v)
        .join(" ");
    document.body.append(editorIframe);
    editorIframe.addEventListener("load", () => {
        editorIframe.contentWindow.postMessage(
            {
                type: "native-editor",
                data: { nativeAuthKey },
            },
            editorOrigin
        );
    });
});
ipcRenderer.on("pass-editor", (evt, type, ...args) => {
    if (!editorIframe) return;
    editorIframe.contentWindow.postMessage(
        {
            type,
            data: args.length === 1 ? args[0] : args,
        },
        editorOrigin
    );
});

ipcRenderer.on("reset", () => {
    channels.forEach((v) => v.unload(false));
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
        stream: true,
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
    (evt, sound, channel = "default", { loop = false, volume = 1 } = {}) => {
        const clip = registerClip(sound);
        unloadChannel(channel);
        channels.set(channel, clip);
        clip.play({ loop, volume });
    }
);
ipcRenderer.on(
    "play-chain",
    async (evt, sound, from, channel = "default", { volume = 1 } = {}) => {
        const chain = await registerChain(sound);
        if (channels.get(channel) !== chain) {
            unloadChannel(channel);
            channels.set(channel, chain);
        }
        chain.startPlaying(from, { volume });
    }
);
ipcRenderer.on("stop", (evt, channel) => {
    const sound = channels.get(channel);
    if (!sound) return;
    sound.unload();
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
