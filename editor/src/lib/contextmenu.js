import { get, writable } from "svelte/store";

// export default function contextmenu(node, menu) {}
export const currentContextmenu = writable(null);

export function showContextmenu(menu, evt, id = null) {
    currentContextmenu.set({ menu, pos: [evt.pageX, evt.pageY], id });
}
export function reset(id = null) {
    if (
        id &&
        ((Array.isArray(id) && !id.includes(get(currentContextmenu)?.id)) ||
            (typeof id === "string" && get(currentContextmenu)?.id !== id))
    )
        return;
    currentContextmenu.set(null);
}

window.addEventListener("keydown", (evt) => {
    if (evt.key === "Escape" && get(currentContextmenu)) reset();
});
