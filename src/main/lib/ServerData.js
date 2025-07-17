export default class ServerData {
    constructor({ sequences = [] } = {}) {
        this.sequences = sequences || [];
    }
    get storeData() {
        return JSON.stringify(this);
    }
}
