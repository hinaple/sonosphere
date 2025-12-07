import { writable } from "svelte/store";
import { migration } from "./migration";

export const sounds = writable(null);
export const chains = writable(null);
export const sequences = writable(null);
export const unsaved = writable(false);

unsaved.subscribe((us) => {
    document.title = "Sonosphere" + (us ? " ●" : "");
});

export function storeSetupInfo(setupInfo) {
    sounds.set(setupInfo.sounds);
    chains.set(setupInfo.data.chains);
    sequences.set(migration(setupInfo.data.sequences));
    console.log("Setup Info: ", setupInfo);
}
