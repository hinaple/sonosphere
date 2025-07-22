import getContext from "./_context";
import { convertToMono, getFadeOutDuration, locateSound } from "./utils";

const ALMOST_OFF_VOL = 0.0001;

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export default class AudioClip {
    static type = "clip";

    constructor(
        url,
        { context = getContext(), volume = 1, onunload = null } = {}
    ) {
        this.context = context;

        this.url = locateSound(url);
        this._volume = volume;

        this.buffer = null;
        this.source = null;
        this.isPlaying = false;

        this.gainNode = this.context.createGain();
        this.gainNode.connect(this.context.destination);

        this.onunload = onunload;
    }

    load({ convertMono = false } = {}) {
        if (this.buffer) return;
        if (this.loadPromise) return this.loadPromise;
        this.loadPromise = new Promise(async (res) => {
            const response = await fetch(this.url);
            const arrayBuffer = await response.arrayBuffer();
            this.buffer = await this.context.decodeAudioData(arrayBuffer);
            if (convertMono)
                this.buffer = convertToMono(this.context, this.buffer);
            this.loadPromise = null;
            res();
        });
        return this.loadPromise;
    }

    async play({
        onended = null,
        loop = false,
        volume = null,
        unloadAfterEnded = true,
        delay = 0,
    } = {}) {
        if (volume) this.volume = volume;

        if (!this.buffer) await this.load();
        this.stop();
        this.source = this.context.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.loop = loop;
        this.source.connect(this.gainNode);

        if (onended || unloadAfterEnded)
            this.source.addEventListener(
                "ended",
                () => {
                    if (onended) onended();
                    if (unloadAfterEnded) this.unload();
                },
                { once: true }
            );

        if (unloadAfterEnded)
            this.source.addEventListener("forceStop", () => this.unload(), {
                once: true,
            });

        this.source.start(this.context.currentTime + delay);
        this.isPlaying = true;
    }

    async stop({ delay = 0, willDispatch = true } = {}) {
        this.isPlaying = false;
        if (!this.source) return;

        this.source.stop(this.context.currentTime + delay);
        if (delay) await sleep(delay * 1000);
        this.source?.disconnect?.();
        if (willDispatch) this.source?.dispatchEvent?.(new Event("forceStop"));
        this.source = null;
    }

    unload(doDispatch = true) {
        this.stop({ willDispatch: false });
        this.buffer = null;
        if (doDispatch) this.onunload?.(this.url);
    }

    set volume(vol) {
        this._volume = vol;
        this.gainNode.gain.setValueAtTime(vol, this.context.currentTime);
    }

    get volume() {
        return this._volume;
    }

    dissolveVolume(vol, duration = 1) {
        if (vol === 0) vol = ALMOST_OFF_VOL;
        this._volume = vol;
        this.gainNode.gain.exponentialRampToValueAtTime(
            vol,
            this.context.currentTime + duration
        );
    }

    fadeOut(speed = 0.5) {
        this.gainNode.gain.setTargetAtTime(0, this.context.currentTime, speed);
        const duration = getFadeOutDuration(speed, this.volume, ALMOST_OFF_VOL);
        console.log(`GONNA TAKE ${duration} SECS`);
        if (duration === Infinity || duration < 0 || isNaN(duration))
            return false;
        return this.stop({ delay: duration });
    }
}
