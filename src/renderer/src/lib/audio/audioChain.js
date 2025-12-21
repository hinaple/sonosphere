import AudioClip from "./audioClip";
import getContext from "./_context";

export default class AudioChain {
    static type = "chain";

    constructor(
        segmentsArr,
        { context = getContext(), onunload = null, volume = 1 } = {}
    ) {
        // segmentsArr<({
        //  clip?: AudioClip,
        //  url: String,
        //  loop: Boolean,
        //  alias?: String,
        //  when?: "afterLoop" | null
        // })[]>
        this.segments = segmentsArr.map((seg) => ({
            clip:
                seg.clip ?? new AudioClip(seg.url, { context, stream: false }),
            ...seg,
        }));
        this.context = context;
        this.current = -1;
        this.playing = false;
        this._volume = volume;
        this.onunload = onunload;

        this.unloaded = false;
    }
    readyNext() {
        if (this.segments.length <= this.current + 1) return;

        this.segments[this.current + 1].clip.load();
    }
    get currentSegment() {
        return this.segments[this.current];
    }
    get loopDelay() {
        if (!this.looping || !this.playing) return 0;
        const waitTime =
            this.loopDuration -
            ((this.context.currentTime - this.loopStartedAt) %
                this.loopDuration);

        return waitTime;
    }
    async continuePlay(idx, delay = 0) {
        if (!this.playing) return;

        const nowSeg = this.segments[idx];
        this.current = idx;
        await nowSeg.clip.play({
            loop: nowSeg.loop,
            unloadAfterEnded: true,
            delay,
            volume: this.volume,
            ...(!nowSeg.loop && this.segments.length > this.current + 1
                ? {
                      onended: () => {
                          if (this.playing && nowSeg === this.currentSegment)
                              this.continuePlay(this.current + 1);
                      },
                  }
                : {}),
        });
        this.readyNext();
        if (nowSeg.loop) {
            this.looping = true;
            this.loopStartedAt = this.context.currentTime;
            this.loopDuration = nowSeg.clip.source.buffer.duration;
        } else {
            this.looping = false;
            this.loopStartedAt = null;
            this.loopDuration = null;
        }
    }
    async startPlaying(from = 0, { volume = null } = {}) {
        if (volume) this.volume = volume;
        if (typeof from === "string")
            from = this.segments.findIndex(
                ({ url, alias = null }) => alias === from || url === from
            );
        if (
            from < 0 ||
            from == null ||
            isNaN(from) ||
            from >= this.segments.length
        )
            return;

        const swapDelay =
            this.playing &&
            this.looping &&
            this.segments[from].when === "afterLoop"
                ? this.loopDelay
                : 0;

        if (this.playing) this.currentSegment.clip.stop({ delay: swapDelay });

        this.playing = true;
        this.continuePlay(from, swapDelay);
    }
    async stop({ fadeOutSpeed = 0 } = {}) {
        if (!this.playing) return;
        this.playing = false;
        this.looping = false;
        if (!fadeOutSpeed) this.currentSegment.clip.stop();
        else await this.currentSegment.clip.fadeOut(fadeOutSpeed);
        this.unload();
    }
    fadeOut(speed = 0.5) {
        this.stop({ fadeOutSpeed: speed });
    }
    unload(doDispatch = true) {
        if (this.unloaded) return;
        this.unloaded = true;
        this.stop();
        this.segments.forEach((seg) => seg.clip.unload());
        if (doDispatch) this.onunload?.();
    }

    get volume() {
        return this._volume;
    }
    set volume(vol) {
        this._volume = vol;
        const current = this.currentSegment;
        if (!current) return;
        current.volume = vol;
    }
}
