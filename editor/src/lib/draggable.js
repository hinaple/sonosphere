import { get, writable } from "svelte/store";

function distanceBetween(pos1, pos2) {
    return Math.sqrt((pos1[0] - pos2[0]) ** 2 + (pos1[1] - pos2[1]) ** 2);
}

export const draggingThing = writable(null);
let localDragging = null;
let dragNode = null;
let mousePos = null;
export function registerNode(el) {
    dragNode = el;
    moveNode();
}

function moveNode() {
    if (!dragNode || !mousePos) return;
    dragNode.style.left = `${mousePos[0]}px`;
    dragNode.style.top = `${mousePos[1]}px`;
}

const DRAG_MIN_DISTANCE = 20;
document.body.addEventListener("mousemove", (evt) => {
    if (!localDragging) return;
    if (localDragging.actualDragging) {
        mousePos = [evt.pageX, evt.pageY];
        moveNode();
        return;
    }
    if (
        !localDragging.actualDragging &&
        distanceBetween(localDragging.startPos, [evt.pageX, evt.pageY]) >
            DRAG_MIN_DISTANCE
    ) {
        mousePos = [evt.pageX, evt.pageY];
        localDragging.actualDragging = true;
        draggingThing.set({
            ...localDragging.matterData,
            symbol: localDragging.symbol,
        });
        localDragging.node.dispatchEvent(new Event("dragstart"));
        if (localDragging.className)
            localDragging.node.classList.add(localDragging.className);
    }
});
document.body.addEventListener("mouseup", (evt) => {
    if (!localDragging) return;
    if (
        !localDragging.actualDragging &&
        (evt.target === localDragging.node ||
            localDragging.node.contains(evt.target))
    )
        localDragging.node.dispatchEvent(new Event("realclick"));
    if (hovering) {
        localDragging.node.dispatchEvent(new Event("dragdrop"));
        if (localDragging.className)
            localDragging.node.classList.remove(localDragging.className);
        hovering.dispatchEvent(
            new CustomEvent("hoverdrop", { detail: localDragging.matterData })
        );
        hovering = null;
    } else if (localDragging.actualDragging) {
        localDragging.node.dispatchEvent(new Event("dragcancel"));
        if (localDragging.className)
            localDragging.node.classList.remove(localDragging.className);
    }
    localDragging = null;
    draggingThing.set(null);
    dragNode = null;
    hoverEnd();
});

export default function draggable(node, { type, data, className = null }) {
    let dragging = false;
    let startPos = null;
    let symbol = Symbol();
    node.addEventListener("mousedown", (evt) => {
        if (localDragging) return;
        dragging = true;
        localDragging = {
            startPos: [evt.pageX, evt.pageY],
            actualDragging: false,
            matterData: {
                type,
                data: typeof data === "function" ? data() : data,
            },
            symbol,
            node,
            className,
        };
    });
    return {
        update({ type: newType, data: newData }) {
            type = newType;
            data = newData;
        },
        destroy() {
            if (!dragging) return;
            if (get(draggingThing)?.symbol === symbol) draggingThing.set(null);
        },
    };
}

let hovering = null;
function hoverEnd() {
    if (!hovering) return;
    hovering.dispatchEvent(new Event("hoverend"));
    hovering = null;
}
export function dropzone(node, { accepts = [] }) {
    node.addEventListener("mouseenter", () => {
        if (
            localDragging &&
            localDragging.actualDragging &&
            accepts.includes(localDragging.matterData.type)
        ) {
            if (hovering && hovering !== node) hoverEnd();
            hovering = node;
            node.dispatchEvent(new Event("hoverstart"));
        }
    });
    node.addEventListener("mouseleave", () => {
        if (hovering === node) hoverEnd();
    });
    return {
        destroy() {
            if (hovering !== node) return;
            hovering = null;
        },
    };
}
