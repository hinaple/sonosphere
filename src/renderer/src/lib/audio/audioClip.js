import getContext from "./_context";
import { convertToMono, getFadeOutDuration, locateSound } from "./utils";

const ALMOST_OFF_VOL = 0.0001;

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export default class AudioClip {
    static type = "clip";

    constructor(
        url,
        {
            context = getContext(),
            volume = 1,
            onunload = null,
            stream = false,
        } = {}
    ) {
        this.context = context;

        this.url = locateSound(url);
        this._volume = volume;

        this.stream = stream;
        this.source = null;
        this.buffer = null;
        this.audio = null;

        this.isPlaying = false;

        this.gainNode = this.context.createGain();
        this.gainNode.connect(this.context.destination);

        this.onunload = onunload;

        this.unloaded = false;
    }

    async loadBuffer({ convertMono = false } = {}) {
        const response = await fetch(this.url);
        const arrayBuffer = await response.arrayBuffer();
        this.buffer = await this.context.decodeAudioData(arrayBuffer);
        if (convertMono) this.buffer = convertToMono(this.context, this.buffer);
    }
    loadStream() {
        return new Promise((res) => {
            const audio = new Audio(this.url);
            audio.preload = "auto";
            audio.crossOrigin = "anonymous";

            audio.addEventListener(
                "canplay",
                () => {
                    this.audio = audio;

                    this.source = this.context.createMediaElementSource(audio);
                    this.source.connect(this.gainNode);

                    this.volume = this._volume;
                    res();
                },
                { once: true }
            );
        });
    }
    load(opt = {}) {
        if ((!this.stream && this.buffer) || (this.stream && this.audio))
            return;
        if (this.loadPromise) return this.loadPromise;
        this.loadPromise = (
            this.stream ? this.loadStream() : this.loadBuffer(opt)
        ).then(() => (this.loadPromise = null));
        return this.loadPromise;
    }

    playBuffer({
        onended = null,
        loop = false,
        unloadAfterEnded = true,
        delay = 0,
    } = {}) {
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
    }
    async playStream({
        onended = null,
        loop = false,
        unloadAfterEnded = true,
        delay = 0,
    }) {
        this.audio.loop = loop;

        if (onended || unloadAfterEnded) {
            this.audio.onended = () => {
                onended?.();
                if (unloadAfterEnded) this.unload();
            };
        }

        if (delay) await sleep(delay * 1000);
        await this.audio.play();
    }
    async play({
        onended = null,
        loop = false,
        volume = null,
        unloadAfterEnded = true,
        delay = 0,
    } = {}) {
        if (this.unloaded) return;

        if (volume) this.volume = volume;

        await this.load();
        if (this.unloaded) return;

        await this.stop();

        if (this.stream) {
            this.playStream({
                onended,
                loop,
                unloadAfterEnded,
                delay,
            });
        } else
            this.playBuffer({
                onended,
                loop,
                unloadAfterEnded,
                delay,
            });
        this.isPlaying = true;
    }

    async stop({ delay = 0, willDispatch = true } = {}) {
        this.isPlaying = false;

        const source = this.source;
        const audio = this.audio;

        if (!source && !audio) return;

        if (!this.stream && source) {
            source.stop(this.context.currentTime + delay);
        }

        if (delay) await sleep(delay * 1000);

        if (!this.stream && this.source === source) {
            source.disconnect();
            if (willDispatch) source.dispatchEvent(new Event("forceStop"));
            this.source = null;
        }

        if (this.stream && audio && this.audio === audio) {
            audio.pause();
            audio.currentTime = 0;
            if (willDispatch) audio.dispatchEvent(new Event("forceStop"));
        }
    }

    async unload(doDispatch = true) {
        if (this.unloaded) return;
        this.unloaded = true;
        await this.stop({ willDispatch: false });
        this.source?.disconnect();

        this.audio = this.source = this.buffer = null;

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
        if (!isFinite(duration) || duration < 0 || isNaN(duration))
            return false;
        return this.stop({ delay: duration });
    }
}
