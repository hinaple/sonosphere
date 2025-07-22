export default class ServerData {
    constructor({ sequences = [], chains = [] } = {}) {
        this.sequences = new Map(sequences || []);
        this.chains = new Map(chains || []);
    }
    get arrayData() {
        return {
            sequences: [...this.sequences],
            chains: [...this.chains],
        };
    }
    get storeData() {
        return JSON.stringify(this.arrayData);
    }
}
