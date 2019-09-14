import Series from '../../controller/objects/series';
import ComperatorResult, { AbsoluteResult } from './comperator-results.ts/comperator-result';
import MultiProviderResult from '../../api/multi-provider-result';
import titleCheckHelper from '../title-check-helper';
import ProviderList from '../../controller/provider-manager/provider-list';
import ReleaseYearComperator from './release-year-comperator';

export default class MultiProviderComperator {
    static async compareMultiProviderWithSeries(series: Series, result: MultiProviderResult): Promise<ComperatorResult>{
        const finalResult = new ComperatorResult();

        const tempSeries = new Series();
        await tempSeries.addProviderDatas(result.mainProvider, ...result.subProviders);
        const seasonA = await series.getSeason();
        const seasonB = await tempSeries.getSeason();
        finalResult.matchAble += 2;
        if (await titleCheckHelper.checkSeriesNames(series, tempSeries)) {
            finalResult.matches += 2;
            if (ProviderList.getExternalProviderInstance(result.mainProvider).hasUniqueIdForSeasons) {
                if (seasonA) {
                     finalResult.matchAble += 2;
                    if (seasonA === seasonB) {
                        finalResult.matches += 2;
                        finalResult.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                    } else if (!seasonB && seasonA === 1) {
                        finalResult.matches += 1;
                        finalResult.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                    } else {
                        finalResult.isAbsolute = AbsoluteResult.ABSOLUTE_FALSE;
                    }
                }
            } else {
                finalResult.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
            }
        } else {
            finalResult.isAbsolute = AbsoluteResult.ABSOLUTE_FALSE;
        }
        const releaseYearResult = await ReleaseYearComperator.compareReleaseYear(series, tempSeries);
        finalResult.matchAble += releaseYearResult.matchAble;
        finalResult.matches += releaseYearResult.matches;
    return finalResult;
   }
}