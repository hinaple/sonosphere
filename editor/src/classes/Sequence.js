export default class Sequence {
    constructor({ alias = null, trigger = null, works = [] }) {
        this.alias = alias;
        this.trigger = trigger;
        this.works = works;
    }
}
