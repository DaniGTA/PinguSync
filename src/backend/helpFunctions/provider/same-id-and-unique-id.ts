export default class SameIdAndUniqueId {
    public sameId: boolean = false;
    public uniqueIdForSeasons: boolean = false;
    constructor(sameId: boolean = false, uniqueIdForSeasons: boolean = false) {
        this.sameId = sameId;
        this.uniqueIdForSeasons = uniqueIdForSeasons;
    }
}
