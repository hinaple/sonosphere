import type { Action } from "svelte/action";
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
        const dataRef = localDragging.dataRef;
        localDragging.matterData.data =
            typeof dataRef === "function" ? dataRef() : dataRef;
        draggingThing.set({
            ...localDragging.matterData,
            symbol: localDragging.symbol,
        });
        localDragging.node.dispatchEvent(new CustomEvent("dragstart"));
        if (localDragging.className)
            localDragging.node.classList.add(localDragging.className);

        renderAutoScroll(performance.now(), true);
    }
});
document.body.addEventListener("mouseup", (evt) => {
    if (!localDragging) return;
    if (
        !localDragging.actualDragging &&
        (evt.target === localDragging.node ||
            localDragging.node.contains(evt.target))
    )
        localDragging.node.dispatchEvent(new CustomEvent("realclick"));
    if (hovering) {
        localDragging.node.dispatchEvent(new CustomEvent("dragdrop"));
        if (localDragging.className)
            localDragging.node.classList.remove(localDragging.className);
        hovering.dispatchEvent(
            new CustomEvent("hoverdrop", { detail: localDragging.matterData })
        );
        hovering = null;
    } else if (localDragging.actualDragging) {
        localDragging.node.dispatchEvent(new CustomEvent("dragcancel"));
        if (localDragging.className)
            localDragging.node.classList.remove(localDragging.className);
    }
    localDragging = null;
    draggingThing.set(null);
    dragNode = null;
    hoverEnd();
});

const draggable: Action<
    HTMLElement,
    { type: string; data: any; className: string | null }
> = (node: HTMLElement, { type, data, className = null }) => {
    let dragging = false;
    let symbol = Symbol();
    node.addEventListener("mousedown", (evt) => {
        if (
            localDragging ||
            (evt.target as HTMLElement).dataset.undraggable !== undefined
        )
            return;
        dragging = true;
        localDragging = {
            startPos: [evt.pageX, evt.pageY],
            actualDragging: false,
            dataRef: data,
            matterData: {
                type,
                data: null,
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
};
export default draggable;

let hovering = null;
function hoverEnd() {
    if (!hovering) return;
    hovering.dispatchEvent(new CustomEvent("hoverend"));
    hovering = null;
}
export const dropzone: Action<HTMLElement, { accepts?: string[] }> = (
    node: HTMLElement,
    { accepts = [] }: { accepts?: string[] } = {}
) => {
    node.addEventListener("mouseenter", () => {
        if (
            localDragging &&
            localDragging.actualDragging &&
            accepts.includes(localDragging.matterData.type)
        ) {
            if (hovering && hovering !== node) hoverEnd();
            hovering = node;
            node.dispatchEvent(
                new CustomEvent("hoverstart", {
                    detail: localDragging.matterData,
                })
            );
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
};

type autoScrollAxisOption = {
    detectSize: number;
    maxSpeed: number;
    isRelative: boolean;
} | null;

const autoScrollSpeeds: Map<HTMLElement, number[]> = new Map();

type AutoscrollParams = {
    scroll?: {
        x?: Partial<autoScrollAxisOption>;
        y?: Partial<autoScrollAxisOption>;
    };
    accepts?: string[];
};
export const autoscroller: Action<HTMLElement, AutoscrollParams> = (
    node: HTMLElement,
    {
        scroll = {
            x: null,
            y: {},
        },
        accepts = [],
    }: AutoscrollParams = {}
) => {
    const options: autoScrollAxisOption[] = ["x", "y"].map((axis) =>
        scroll[axis]
            ? {
                  detectSize: 20,
                  maxSpeed: 2,
                  isRelative: true,
                  ...scroll[axis],
              }
            : null
    );
    let border: { start: number; size: number }[] | null = null;
    let absoluteOpt: { detectSize: number; maxSpeed: number }[] | null;

    const resizeObserver = new ResizeObserver(() => {
        const rect = node.getBoundingClientRect();
        border = [
            {
                start: rect.x,
                size: rect.width,
            },
            {
                start: rect.y,
                size: rect.height,
            },
        ];
        absoluteOpt = border.map(({ size }, i) =>
            options[i]
                ? {
                      detectSize:
                          options[i].detectSize *
                          (options[i].isRelative ? size / 100 : 1),
                      maxSpeed: options[i].maxSpeed,
                  }
                : null
        );
    });
    resizeObserver.observe(node);

    autoScrollSpeeds.set(node, [0, 0]);

    node.addEventListener("mousemove", ({ clientX, clientY }) => {
        if (
            !border ||
            !absoluteOpt ||
            !localDragging?.actualDragging ||
            (accepts.length && !accepts.includes(localDragging.matterData.type))
        )
            return;

        autoScrollSpeeds.set(
            node,
            [clientX, clientY].map((pos, i) => {
                if (!absoluteOpt[i]) return 0;

                const inPos = pos - border[i].start;
                if (inPos < 0 || inPos > border[i].size) return 0;

                const startSpeedFactor = 1 - inPos / absoluteOpt[i].detectSize;
                if (startSpeedFactor >= 0 && startSpeedFactor <= 1)
                    return startSpeedFactor * absoluteOpt[i].maxSpeed * -1;

                const endSpeedFactor =
                    1 - (border[i].size - inPos) / absoluteOpt[i].detectSize;
                if (endSpeedFactor >= 0 && endSpeedFactor <= 1)
                    return endSpeedFactor * absoluteOpt[i].maxSpeed;

                return 0;
            })
        );
    });
    node.addEventListener("mouseleave", () => {
        autoScrollSpeeds.set(node, [0, 0]);
    });

    return {
        destroy: () => {
            resizeObserver.disconnect();
            autoScrollSpeeds.delete(node);
        },
    };
};

let prvTs = 0,
    isAutoScrolling = false;
function renderAutoScroll(ts = 0, start = false) {
    if (start && isAutoScrolling) return;
    if (!localDragging?.actualDragging || !autoScrollSpeeds.size) {
        isAutoScrolling = false;
        return;
    }

    if (start) {
        isAutoScrolling = true;
        prvTs = ts;
    }
    let tsOffset = ts - prvTs;
    autoScrollSpeeds.forEach((speed, node) => {
        node.scrollBy(...(speed.map((s) => s * tsOffset) as [number, number]));
    });
    prvTs = ts;

    requestAnimationFrame(renderAutoScroll);
}
