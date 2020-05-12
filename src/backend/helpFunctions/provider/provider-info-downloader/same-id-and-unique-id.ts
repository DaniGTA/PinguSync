export default class SameIdAndUniqueId {
    public sameId = false;
    public uniqueIdForSeasons = false;
    constructor(sameId = false, uniqueIdForSeasons = false) {
        this.sameId = sameId;
        this.uniqueIdForSeasons = uniqueIdForSeasons;
    }
}
