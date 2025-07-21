import { SerialPort } from "serialport";

export default class SerialConnector {
    constructor(ondata) {
        this.port = null;
        this.ondata = ondata;
    }

    async open(portAlias, path, baudRate = 9600) {
        if (this.port) this.port.close();

        let realPort = path;

        if (portAlias || !path) {
            const list = await SerialPort.list();
            realPort =
                list.find((p) => {
                    if (!p.friendlyName && !p.pnpId) return false;
                    if (portAlias) return p.friendlyName.includes(portAlias);
                    else
                        return (p.friendlyName || p.pnpId)
                            ?.toLowerCase?.()
                            ?.match(/usb[-_]serial/);
                })?.path ?? path;
        }

        if (!realPort) {
            console.log("unavailable to find serial device.");
            return;
        }

        this.port = new SerialPort({
            path: realPort,
            baudRate: baudRate ?? 9600,
        });

        console.log("SERIAL OPENED: ", realPort);

        this.port.on("readable", () => {
            const data = this.port.read();
            this.ondata?.(data.toString().trim());
        });
    }

    send(data) {
        if (!this.port) {
            console.log("No port connection");
            return;
        }
        this.port.write(data.toString());
    }

    close() {
        if (!this.port) return;
        this.port.close();
        this.port = null;
    }
}
