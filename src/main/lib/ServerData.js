export default class ServerData {
    constructor(
        { sequences = [], chains = [], version = null } = {},
        isNewData = false
    ) {
        this.sequences = new Map(sequences || []);
        this.chains = new Map(chains || []);
        isNewData ? this.renewVersion() : (this.version = version);
    }
    renewVersion() {
        const newVer = new Date().getTime().toString();
        this.version = newVer;
        return newVer;
    }
    get arrayData() {
        return {
            version: this.version,
            sequences: [...this.sequences],
            chains: [...this.chains],
        };
    }
    get storeData() {
        return JSON.stringify(this.arrayData);
    }
}
