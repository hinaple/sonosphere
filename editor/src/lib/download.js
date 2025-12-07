export default function download(src, filename = null) {
    const el = document.createElement("a");
    el.href = src;
    if (filename) el.download = filename;
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
}
