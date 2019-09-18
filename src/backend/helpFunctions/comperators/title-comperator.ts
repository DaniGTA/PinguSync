import Series from '../../controller/objects/series';
import ComperatorResult from './comperator-results.ts/comperator-result';
import titleCheckHelper from '../title-check-helper';

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
    static async compareTitle(a: Series, b: Series,aFirstSeason:Series|null,bFirstSeason:Series|null): Promise<ComperatorResult>{
        const comperatorResult = new ComperatorResult();
        const aNames = a.getAllNames();
        const bNames = b.getAllNames();

        if (aNames.length === 0 && bNames.length === 0) {
            return comperatorResult;
        } else {
            comperatorResult.matchAble += 4;
            if (await titleCheckHelper.checkSeriesNames(a, b)) {
                comperatorResult.matches += 4;
            } else if (aFirstSeason) {
                if (await titleCheckHelper.checkSeriesNames(aFirstSeason, b)) {
                    comperatorResult.matches += 4;
                }
            } else if (bFirstSeason) {
                if (await titleCheckHelper.checkSeriesNames(a, bFirstSeason)) {
                    comperatorResult.matches += 4;
                }
            }
        }
        return comperatorResult;
   }
}