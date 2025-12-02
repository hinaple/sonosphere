const ClickEls = new Map();

export function cancelSoftClick(node) {
    ClickEls.get(node)?.();
}

export default function softclick(node, evtOpt = {}) {
    let clicking = false;
    ClickEls.set(node, () => {
        clicking = false;
    });
    node.addEventListener(
        "mousedown",
        (evt) => {
            if (evt.target.dataset.softclickException !== undefined) return;
            clicking = true;
        },
        evtOpt
    );
    node.addEventListener("mouseleave", () => {
        clicking = false;
    });
    node.addEventListener(
        "mouseup",
        (evt) => {
            if (evt.target.dataset.softclickException !== undefined) return;
            if (clicking) node.dispatchEvent(new CustomEvent("softclick"));
            clicking = false;
        },
        evtOpt
    );

    return {
        destroy() {
            ClickEls.delete(node);
        },
    };
}
