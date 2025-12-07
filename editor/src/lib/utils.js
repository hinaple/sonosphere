import { url } from "./socket";

export function getHttpUrl() {
    return `${location.protocol}//${url}`;
}
export function getSoundFileUrl(filename) {
    return `${getHttpUrl()}/sounds/${filename}`;
}
