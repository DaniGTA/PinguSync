import Series from '../../controller/objects/series';
import ComperatorResult from './comperator-results.ts/comperator-result';
import MultiProviderResult from 'src/backend/api/multi-provider-result';
import titleCheckHelper from '../title-check-helper';
import ProviderList from 'src/backend/controller/provider-manager/provider-list';
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
                    } else if (!seasonB && seasonA === 1) {
                         finalResult.matches += 1;
                    }
                }
            }
        }
        const releaseYearResult = await ReleaseYearComperator.compareReleaseYear(series, tempSeries);
        finalResult.matchAble += releaseYearResult.matchAble;
        finalResult.matches += releaseYearResult.matches;
    return finalResult;
   }
}