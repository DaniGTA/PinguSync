import MultiProviderResult from '../../api/provider/multi-provider-result';
import Series from '../../controller/objects/series';
import { SeasonError } from '../../controller/objects/transfer/season-error';
import logger from '../../logger/logger';
import titleCheckHelper from '../name-helper/title-check-helper';
import { SeasonSearchMode } from '../season-helper/season-search-mode';
import StringHelper from '../string-helper';
import ComperatorResult, { AbsoluteResult } from './comperator-results.ts/comperator-result';
import MediaTypeComperator from './media-type-comperator';
import ProviderComperator from './provider-comperator';
import ReleaseYearComperator from './release-year-comperator';
import SeasonComperator from './season-comperator';
import Name from '../../controller/objects/meta/name';

export default class MultiProviderComperator {
    public static async compareMultiProviderWithSeries(series: Series, result: MultiProviderResult): Promise<ComperatorResult> {
        const finalResult = new ComperatorResult();

        const tempSeries = new Series();
        await tempSeries.addProviderDatasWithSeasonInfos(result.mainProvider, ...result.subProviders);
        const seasonA = await series.getSeason();
        const seasonB = await tempSeries.getSeason(SeasonSearchMode.NO_EXTRA_TRACE_REQUESTS);

        finalResult.matchAble += 6;
        if (await titleCheckHelper.checkSeriesNames(series, tempSeries)) {
            finalResult.matches += 2;
            if (await this.isSeriesNameAbsoluteSame(series, tempSeries)) {
                finalResult.matches += 2;
            }
            if (seasonA.seasonError !== SeasonError.CANT_GET_SEASON) {
                finalResult.matchAble += 2;
                if (SeasonComperator.isSameSeason(seasonA, seasonB)) {
                    finalResult.matches += 2;
                    finalResult.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                } else if ((seasonB.seasonError === SeasonError.CANT_GET_SEASON || seasonB.seasonError === SeasonError.NONE) &&
                    seasonA.seasonNumbers.includes(1)) {
                    finalResult.matches += 1;
                    finalResult.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                }
            }

        } else {
            finalResult.isAbsolute = AbsoluteResult.ABSOLUTE_FALSE;
        }

        const mediaTypeResult = await MediaTypeComperator.compareMediaTypeWithSeries(series, tempSeries);
        finalResult.matchAble += mediaTypeResult.matchAble;
        finalResult.matches += mediaTypeResult.matches;
        if (mediaTypeResult.isAbsolute === AbsoluteResult.ABSOLUTE_FALSE) {
            finalResult.isAbsolute = AbsoluteResult.ABSOLUTE_FALSE;
        }

        const releaseYearResult = await ReleaseYearComperator.compareReleaseYear(series, tempSeries);
        finalResult.matchAble += releaseYearResult.matchAble;
        finalResult.matches += releaseYearResult.matches;

        const providerComperatorInstance = new ProviderComperator(series, tempSeries);
        const providerResult = await providerComperatorInstance.getCompareResult();
        finalResult.matchAble += providerResult.matchAble;
        finalResult.matches += providerResult.matches;
        if (providerResult.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE) {
            finalResult.isAbsolute = providerResult.isAbsolute;
        }


        if (finalResult.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE || finalResult.matchAble === finalResult.matches) {
            for (const serie of await series.getSlugNames()) {
                for (const tempserie of await tempSeries.getSlugNames()) {
                    if (serie.name !== tempserie.name) {
                        logger.warn('[MultiProviderComperator] Not same slug id | ' + serie.name + ' != ' + tempserie.name);
                    }
                }
            }
        } else {
            try {
                logger.debug('[MultiProviderComperator] not the same series' + result.mainProvider.providerLocalData.getAllNames()[0].name + '(' + result.mainProvider.providerLocalData.provider + ')' + ' &' + series.getAllNames()[0].name);
            } catch (err) {
                logger.debug('[MultiProviderComperator] cant print error msg.');
                logger.debug(err);
            }
        }

        return finalResult;
    }

    private static async isSeriesNameAbsoluteSame(seriesA: Series, seriesB: Series): Promise<boolean> {
        const nameAProcess = seriesA.getAllNamesSeasonAware();
        const nameBProcess = seriesB.getAllNamesSeasonAware();

        return this.isNameListAbsoluteSame(nameAProcess, nameBProcess);
    }

    private static async isNameListAbsoluteSame(nameAList: Name[], nameBList: Name[]): Promise<boolean> {

        const cleanedStringListA = nameAList.flatMap((x) => StringHelper.cleanString(x.name));
        const cleanedStringListB = nameBList.flatMap((x) => StringHelper.cleanString(x.name));

        return !!cleanedStringListA.find((nameA) => cleanedStringListB.findIndex((nameB) => nameA === nameB) !== -1);
    }
}
