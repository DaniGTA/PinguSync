import Series from "../controller/objects/series";

class AnimeHelper {
    public async isSameSeason(a: Series, b: Series): Promise<boolean> {
        return a.getSeason() === b.getSeason();
    }
}

export default new AnimeHelper();
