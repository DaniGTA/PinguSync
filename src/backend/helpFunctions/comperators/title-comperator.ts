import Name from '../../controller/objects/meta/name';
import Series from '../../controller/objects/series';
import titleCheckHelper from '../title-check-helper';
import ComperatorResult from './comperator-results.ts/comperator-result';

export default class TitleComperator {
    /**
     * It compares Titles from a and b.
     *
     * For non season provider it can check the first season of both.
     * @param a
     * @param b
     * @param aFirstSeason
     * @param bFirstSeason
     */
    public static async compareTitle(a: Series, b: Series, aFirstSeason: Series | null, bFirstSeason: Series | null): Promise<ComperatorResult> {
        const comperatorResult = new ComperatorResult();
        const aNames = a.getAllNames();
        const bNames = b.getAllNames();

        if (aNames.length === 0 && bNames.length === 0) {
            return comperatorResult;
        } else {
            comperatorResult.matchAble += 4;
            if (await titleCheckHelper.checkSeriesNames(a, b)) {
                comperatorResult.matches += 2;
            } else if (aFirstSeason) {
                if (await titleCheckHelper.checkSeriesNames(aFirstSeason, b)) {
                    comperatorResult.matches += 2;
                }
            } else if (bFirstSeason) {
                if (await titleCheckHelper.checkSeriesNames(a, bFirstSeason)) {
                    comperatorResult.matches += 2;
                }
            }
            if (comperatorResult.matches !== 0) {
                const aSeasonNumber = (await Name.getSeasonNumber(aNames)).seasonNumber;
                const bSeasonNumber = (await Name.getSeasonNumber(bNames)).seasonNumber;
                if (aSeasonNumber === bSeasonNumber) {
                    comperatorResult.matches += 2;
                } else if (aSeasonNumber === undefined && bSeasonNumber !== undefined) {
                    comperatorResult.matches += 1;
                } else if (bSeasonNumber === undefined && aSeasonNumber !== undefined) {
                    comperatorResult.matches += 1;
                }
            }
        }
        return comperatorResult;
    }
}
