import { get } from "svelte/store";
import { unsaved } from "./stores";
import { storeServerData } from "./socket";
import { doBlockJob } from "./blockManager";
import { tryToDownloadProject, tryToUploadProject } from "./projectFile";
import { showToast } from "./toast/toast.svelte.js";
import type { Action } from "svelte/action";

const GlobalShortcuts: Record<
    string,
    Map<Symbol, { ctrl: boolean; shift: boolean; cb: () => any }>
> = {};

export function executeShortcut({
    metaKey = false,
    ctrlKey = false,
    shiftKey = false,
    key,
}) {
    key = key.toLowerCase();
    const cb = GlobalShortcuts[key]
        ?.values?.()
        ?.find?.(
            ({ ctrl, shift }) =>
                (metaKey || ctrlKey) === ctrl && shiftKey === shift
        )?.cb;

    if (cb) {
        cb();
        return true;
    }

    return false;
}

window.addEventListener(
    "keydown",
    (evt) => {
        if (executeShortcut(evt)) evt.preventDefault();
    },
    true
);

export function registerGlobalShortcut(key: string, cb: () => any);
export function registerGlobalShortcut(
    keyOpt: { ctrl?: boolean; shift?: boolean },
    key: string,
    cb: () => any
);
export function registerGlobalShortcut(...args: any[]) {
    const {
        key,
        cb,
        keyOpt: { ctrl = false, shift = false } = {},
    } = args.length === 2
        ? { key: args[0].toLowerCase(), cb: args[1] }
        : { keyOpt: args[0], key: args[1].toLowerCase(), cb: args[2] };
    if (!GlobalShortcuts[key]) GlobalShortcuts[key] = new Map();

    const s = Symbol();
    GlobalShortcuts[key].set(s, { ctrl, shift, cb });

    return () => GlobalShortcuts[key].delete(s);
}

registerGlobalShortcut("delete", () => doBlockJob("delete"));
registerGlobalShortcut({ ctrl: true }, "s", () => {
    storeServerData()
        .then(() => {
            unsaved.set(false);
            showToast({
                content: "Data saved successfully.",
                duration: 700,
            });
        })
        .catch((err) => {
            alert("An error occurred while storing data on the server.");
            console.error(err);
        });
    return true;
});
registerGlobalShortcut({ ctrl: true }, "f", () => doBlockJob("search"));
registerGlobalShortcut({ ctrl: true, shift: true }, "s", () => {
    tryToDownloadProject();
    return true;
});
registerGlobalShortcut({ ctrl: true, shift: true }, "o", () => {
    tryToUploadProject();
    return true;
});

export const globalshortcut: Action<
    HTMLElement,
    {
        key: string;
        ctrl?: boolean;
        shift?: boolean;
        cb: (node: HTMLElement) => any;
    }
> = (node, { key, ctrl = false, shift = false, cb }) => {
    const remover = registerGlobalShortcut({ ctrl, shift }, key, () =>
        cb(node)
    );

    return { destroy: remover };
};
