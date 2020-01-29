import Series from '../../controller/objects/series';
import ComperatorResult from './comperator-results.ts/comperator-result';

export default class ReleaseYearComperator {
    /**
     * It compares the release years of two series.
     *
     * INFO: More DATA more POINTS.
     * INFO: This compare cant give a absolute match, release can be matched to easly for that.
     * @param a series a
     * @param b series b
     */
    public static async compareReleaseYear(a: Series, b: Series): Promise<ComperatorResult> {
        const result = new ComperatorResult();
        const [aYearList, bYearList] = await Promise.all([a.getAllReleaseYears(), b.getAllReleaseYears()]);
        if (aYearList.length !== 0 && bYearList.length !== 0) {
            for (const aYear of aYearList) {
                for (const bYear of bYearList) {
                    result.matchAble++;
                    if (aYear === bYear) {
                        result.matches++;
                    }
                }
            }
        }
        return result;
    }
}
