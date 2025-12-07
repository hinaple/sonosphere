import { url } from "./socket";

export function getSoundFileUrl(filename) {
    return `${location.protocol}//${url}/sounds/${filename}`;
}
