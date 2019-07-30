import Series from "../controller/objects/series";

class AnimeHelper {
    public async isSameSeason(a: Series, b: Series): Promise<boolean> {
        if (typeof a.seasonNumber != 'undefined' && typeof b.seasonNumber != 'undefined') {
            if (a.seasonNumber == b.seasonNumber) {
                return true;
            }
        }
        return false;
    }
}

export default new AnimeHelper();
