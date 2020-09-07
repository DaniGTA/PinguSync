export default class WatchHistory {
    public created = new Date();
    constructor(public timestamp?: number) {

    }
    /** Just a value to mark as watched */
    public watched = true;
}