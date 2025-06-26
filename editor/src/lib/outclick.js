export default function outclick(node) {
    const callback = (evt) => {
        if (node === evt.target || node.contains(evt.target)) return;
        node.dispatchEvent(new Event("outclick"));
    };
    window.addEventListener("mousedown", callback, true);

    return {
        destroy() {
            window.removeEventListener("mousedown", callback, true);
        },
    };
}
