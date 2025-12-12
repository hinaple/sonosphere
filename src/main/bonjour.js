import { Bonjour } from "bonjour-service";

const bonjour = new Bonjour();

export function publishBonjour(port) {
    bonjour.publish({
        name: "sonosphere",
        type: "beyond",
        port,
        disableIPv6: true,
    });
}
