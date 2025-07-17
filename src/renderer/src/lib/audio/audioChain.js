import AudioClip from "./audioClip";
import getContext from "./_context";

export default class AudioChain {
    static type = "chain";

    constructor(segmentsArr, context = getContext()) {
        this.segments = segmentsArr.map((seg) => ({
            clip: new AudioClip(seg.url, { context }),
            ...seg,
        }));
        this.context = context;
        this.current = -1;
        this.playing = false;
        this._volume = 1;
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
    async startPlaying(from = 0) {
        if (typeof from === "string")
            from = this.segments.findIndex(
                ({ alias = null }) => alias === from
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
        if (this.playing) this.stop({ delay: swapDelay });

        this.playing = true;
        this.continuePlay(from, swapDelay);
    }
    stop({ fadeOutSpeed = 0 } = {}) {
        if (!this.playing) return;
        this.playing = false;
        if (!fadeOutSpeed) this.currentSegment.clip.stop();
        else this.currentSegment.clip.fadeOut(fadeOutSpeed);
    }
    unload() {
        this.stop();
        this.segments.forEach((seg) => seg.clip.unload());
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
