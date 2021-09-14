export default class WatchHistory {
    public created = new Date()
    /** Just a value to mark as watched */
    public watched = true
    constructor(public timestamp?: number) {}
}
