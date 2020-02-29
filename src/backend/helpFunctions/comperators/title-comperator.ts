import Name from '../../controller/objects/meta/name';
import Season from '../../controller/objects/meta/season';
import Series from '../../controller/objects/series';
import titleCheckHelper from '../name-helper/title-check-helper';
import ComperatorResult from './comperator-results.ts/comperator-result';
import SeasonComperator from './season-comperator';

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
    public static async compareTitleOfSeries(a: Series, b: Series, aFirstSeason: Series | null, bFirstSeason: Series | null): Promise<ComperatorResult> {
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
                const seasonAPromise = a.getSeason();
                const seasonBPromise = b.getSeason();
                const aSeasonNumber = (await seasonAPromise);
                const bSeasonNumber = (await seasonBPromise);
                if (SeasonComperator.isSameSeasonNumber(aSeasonNumber, bSeasonNumber)) {
                    comperatorResult.matches += 2;
                } else if (aSeasonNumber.isSeasonUndefined() && !bSeasonNumber.isSeasonUndefined()) {
                    comperatorResult.matches += 1;
                } else if (bSeasonNumber.isSeasonUndefined() && !aSeasonNumber.isSeasonUndefined()) {
                    comperatorResult.matches += 1;
                }
            }
        }
        return comperatorResult;
    }
}
