export const playingSound = $state({ soundName: null });

export function playSound(file) {
    playingSound.soundName = file;
}
export function stopPlayingSound() {
    playingSound.soundName = null;
}
