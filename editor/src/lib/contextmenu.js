import { get, writable } from "svelte/store";

export default function contextmenu(node, menu) {}
export const currentContextmenu = writable(null);

export function showContextmenu(menu, evt, id = null) {
    currentContextmenu.set({ menu, pos: [evt.pageX, evt.pageY], id });
}
export function reset(id = null) {
    if (id && get(currentContextmenu)?.id !== id) return;
    currentContextmenu.set(null);
}
