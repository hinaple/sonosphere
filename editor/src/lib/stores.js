import { writable } from "svelte/store";

export const sounds = writable(null);
export const editorCount = writable(null);
export const chains = writable(null);
export const sequences = writable(null);
export const unsaved = writable(false);

unsaved.subscribe((us) => {
    document.title = "Sonosphere" + (us ? " ●" : "");
});
