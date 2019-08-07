import Series from "../controller/objects/series";

class SeriesHelper {
    public async isSameSeason(a: Series, b: Series): Promise<boolean> {
        return a.getSeason() === b.getSeason();
    }
}

export default new SeriesHelper();
