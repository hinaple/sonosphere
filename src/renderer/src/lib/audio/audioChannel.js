import AudioChain from "./audioChain";
import AudioClip from "./audioClip";

export default class AudioChannel {
    constructor(audios) {
        this.audios = Object.entries(audios).reduce(
            (object,
            ([key, { type, data }]) => {
                object[key] =
                    type === "chain"
                        ? new AudioChain(data)
                        : new AudioClip(data);
            }),
            {}
        );
        this.volume = 1;
    }
}
