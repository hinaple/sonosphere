import { ipcRenderer } from "electron";
import { join } from "path";

export function convertToMono(context, buffer) {
    if (buffer.numberOfChannels === 1) return buffer;

    const length = buffer.length;
    const sampleRate = buffer.sampleRate;

    const monoBuffer = context.createBuffer(1, length, sampleRate);
    const monoData = monoBuffer.getChannelData(0);

    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    for (let i = 0; i < length; i++) {
        monoData[i] = (left[i] + right[i]) * 0.5;
    }

    return monoBuffer;
}

export function getFadeOutDuration(speed, fromValue, targetValue) {
    if (targetValue <= 0 || fromValue <= 0) return Infinity;

    return speed * Math.log(fromValue / targetValue);
}

let soundsPath;
ipcRenderer
    .invoke("request-sound-dir")
    .then((location) => (soundsPath = location));

export function locateSound(soundfile) {
    return `file://${join(soundsPath, soundfile)}`;
}
