import ProviderLocalData from '../../controller/provider-manager/local-data/interfaces/provider-local-data';

import MainListManager from '../../controller/main-list-manager/main-list-manager';
import Name from '../../controller/objects/meta/name';
import SeasonNumberResponse from '../../controller/objects/meta/response-object/season-number-response';
import Series from '../../controller/objects/series';
import SearchSeasonValueResult from '../../controller/objects/transfer/search-season-value-results';
import { SeasonError } from '../../controller/objects/transfer/season-error';
import { InfoProviderLocalData } from '../../controller/provider-manager/local-data/info-provider-local-data';
import { ProviderInfoStatus } from '../../controller/provider-manager/local-data/interfaces/provider-info-status';
import { ListProviderLocalData } from '../../controller/provider-manager/local-data/list-provider-local-data';
import logger from '../../logger/logger';
import { AbsoluteResult } from '../comperators/comperator-results.ts/comperator-result';
import { SeasonSearchMode } from './season-search-mode';
import SeasonSearchModeHelper from './season-search-mode-helper';
import { emit } from 'cluster';

class SeasonHelper {

    /**
     * Traceing down.
     *
     * Series A dont have any season information but is related to Series B but it has also no season info but it
     * has a relation to Series C and C have the Season info 1, now Series B knows because its above C it must be one Season higher.
     * At the End Series A knows its Season is 3.
     *
     * Series C - S01       ←
     *  |- Series B - ?     ↑
     *      |- Series A - ? ↑
     *
     * @param series the series where the trace should be performed.
     * @param seriesList a list where the relation should be.
     */
    public async searchSeasonValuePrequelTrace(series: Series, seriesList?: Series[] | readonly Series[]): Promise<SearchSeasonValueResult> {
        logger.debug('[Season] [Search]: Prequel Trace.' + ' (' + series.id + ')');
        let prequel: Series | null = null;
        if (await series.isAnyPrequelPresent() && seriesList) {
            const searchResult = await series.getPrequel(seriesList);
            prequel = searchResult.foundedSeries;
            let searchCount = 0;
            if (searchResult.relationExistButNotFounded) {
                return new SearchSeasonValueResult(-2, 'PrequelTraceNotAvaible', SeasonError.SEASON_TRACING_CAN_BE_COMPLETED_LATER, searchResult);
            } else {
                const mediaTypeSeries = await series.getMediaType();
                while (prequel) {

                    const mediaTypePrequel = await prequel.getMediaType();
                    if (mediaTypePrequel === mediaTypeSeries) {
                        searchCount++;
                        const prequelSeason = await prequel.getSeason(SeasonSearchMode.PREQUEL_TRACE_MODE, seriesList);
                        if (prequelSeason.seasonError === SeasonError.SEASON_TRACING_CAN_BE_COMPLETED_LATER) {
                            return new SearchSeasonValueResult(-2, 'PrequelTraceNotAvaible', SeasonError.SEASON_TRACING_CAN_BE_COMPLETED_LATER, searchResult);
                        }
                        if (prequelSeason.seasonNumber && prequelSeason.seasonError === SeasonError.NONE) {
                            return new SearchSeasonValueResult(prequelSeason.seasonNumber + searchCount, 'PrequelTrace');
                        }
                    }
                    if (await prequel.isAnyPrequelPresent()) {

                        const prequelSearchResult = await prequel.getPrequel(seriesList);
                        if (prequelSearchResult.relationExistButNotFounded) {
                            prequel = null;
                            break;
                        }
                        prequel = prequelSearchResult.foundedSeries;
                    } else if (await prequel.getAverageProviderInfoStatus() === ProviderInfoStatus.FULL_INFO) {

                        return new SearchSeasonValueResult(searchCount, 'PrequelTrace - nomore prequel present');
                    } else {
                        prequel = null;
                    }
                }
            }
            return new SearchSeasonValueResult(-2, 'PrequelTraceNotAvaible', SeasonError.SEASON_TRACING_CAN_BE_COMPLETED_LATER);
        }
        return new SearchSeasonValueResult(-1, 'NoPrequelAvaible', SeasonError.CANT_GET_SEASON);
    }

    /**
     * Traceing up.
     *
     * Series A dont have any season information but is related to Series B but it has also no season info but it
     * has a relation to Series C and C have the Season info 1, now Series B knows because its below C it must be one Season lower.
     * At the End Series A knows its Season is 1.
     *
     * Series A - ?             ↓
     *  |- Series B - ?         ↓
     *      |- Series C - S03   ←
     *
     *
     * @param series the series where the trace should be performed.
     * @param seriesList a list where the relation should be.
     */
    public async searchSeasonValueSequelTrace(series: Series, seriesList?: Series[] | readonly Series[]): Promise<SearchSeasonValueResult> {
        logger.debug('[Season] [Search]: Sequel Trace.' + ' (' + series.id + ')');
        let sequel: Series | null = null;
        if (await series.isAnySequelPresent() && seriesList) {
            const searchResult = await series.getSequel(seriesList);
            sequel = searchResult.foundedSeries;
            let searchCount = 0;
            if (searchResult.relationExistButNotFounded) {
                return new SearchSeasonValueResult(-2, 'SequelTraceNotAvaible', SeasonError.SEASON_TRACING_CAN_BE_COMPLETED_LATER, searchResult);
            } else {
                while (sequel) {
                    if (await sequel.getMediaType() === await series.getMediaType()) {
                        searchCount++;
                        const sequelSeason = await sequel.getSeason(SeasonSearchMode.SEQUEL_TRACE_MODE, seriesList);
                        if (sequelSeason.seasonError === SeasonError.SEASON_TRACING_CAN_BE_COMPLETED_LATER) {
                            return new SearchSeasonValueResult(-2, 'SequelTraceNotAvaible', SeasonError.SEASON_TRACING_CAN_BE_COMPLETED_LATER, searchResult);
                        }
                        if (sequelSeason.seasonNumber && sequelSeason.seasonError === SeasonError.NONE) {
                            return new SearchSeasonValueResult(sequelSeason.seasonNumber - searchCount, 'SequelTrace');
                        }
                    }
                    if (await sequel.isAnySequelPresent()) {

                        const sequelSearchResult = await sequel.getSequel(seriesList);
                        if (sequelSearchResult.relationExistButNotFounded) {
                            sequel = null;
                            break;
                        }
                        sequel = sequelSearchResult.foundedSeries;
                    } else {
                        sequel = null;
                    }
                }
            }
            return new SearchSeasonValueResult(-2, 'SequelTraceNotAvaible', SeasonError.SEASON_TRACING_CAN_BE_COMPLETED_LATER);
        }
        return new SearchSeasonValueResult(-1, 'NoSequelAvaible', SeasonError.CANT_GET_SEASON);
    }

    /**
     * Controlls the search modes and will collect the result rate it and return it.
     * @param series where the season number is missing.
     * @param searchMode what search should be performed ? DEFAULT: `ALL`
     * @param seriesList where the relation should be, this will be needed to perform relation tracing. DEFAULT: `main list`
     */
    public async searchSeasonValue(series: Series, searchMode: SeasonSearchMode = SeasonSearchMode.ALL, seriesList?: Series[] | readonly Series[]): Promise<SearchSeasonValueResult> {
        logger.debug('[Season] [Search]: Season value.' + ' (' + series.id + ') MODE: ' + SeasonSearchMode[searchMode]);

        let prequelResult: SearchSeasonValueResult | undefined;
        let sequelResult: SearchSeasonValueResult | undefined;
        let numberFromName: SeasonNumberResponse | undefined;

        if (!seriesList) {
            seriesList = await MainListManager.getMainList();
        }
        if (SeasonSearchModeHelper.canPerformATitleSearch(searchMode)) {
            numberFromName = await Name.getSeasonNumber(await series.getAllNamesUnique());

            if (numberFromName && numberFromName.seasonNumber && numberFromName.absoluteResult === AbsoluteResult.ABSOLUTE_TRUE) {
                return new SearchSeasonValueResult(numberFromName.seasonNumber, 'Name');
            }
        }


        if (numberFromName && numberFromName.seasonNumber) {
            return new SearchSeasonValueResult(numberFromName.seasonNumber, 'Name');
        }



        if (SeasonSearchModeHelper.canPerformAProviderSeasonValueSearch(searchMode)) {
            for (const provider of series.getListProvidersInfos()) {
                const targetSeason = series.getProviderSeasonTarget(provider.provider);
                if (targetSeason) {
                    return new SearchSeasonValueResult(targetSeason, 'Provider: ' + provider.provider);
                }
            }
        }

        if (SeasonSearchModeHelper.canPerformAPrequelTrace(searchMode)) {
            prequelResult = await this.searchSeasonValuePrequelTrace(series, seriesList);
            if (prequelResult.seasonError === SeasonError.NONE) {
                return prequelResult;
            }
        }

        if (SeasonSearchModeHelper.canPerformASequelTrace(searchMode)) {
            sequelResult = await this.searchSeasonValueSequelTrace(series, seriesList);
            if (sequelResult.seasonError === SeasonError.NONE) {
                return sequelResult;
            }
        }

        if (prequelResult && prequelResult.seasonError === SeasonError.SEASON_TRACING_CAN_BE_COMPLETED_LATER) {
            return prequelResult;
        }

        if (sequelResult && sequelResult.seasonError === SeasonError.SEASON_TRACING_CAN_BE_COMPLETED_LATER) {
            return sequelResult;
        }

        try {
            if (!await series.isAnyPrequelPresent() && await series.isAnySequelPresent()) {
                return new SearchSeasonValueResult(1, 'NoPrequelButSequel');
            }
        } catch (err) {
            logger.warn(err);
        }

        return new SearchSeasonValueResult(-1, 'None', SeasonError.CANT_GET_SEASON);
    }

    /**
     * A prequel was found but it is not in the list.
     * So a dummy will be created where all provider data can be filled in.
     * @param localDatas
     */
    public async createTempSeriesFromPrequels(localDatas: ProviderLocalData[]): Promise<Series[]> {
        const result: Series[] = [];
        logger.info('[SeasonHelper] create temp series');
        for (const entry of localDatas) {
            for (const prequelId of entry.prequelIds) {
                if (prequelId !== undefined && prequelId !== null) {
                    const series = new Series();
                    if (entry instanceof ListProviderLocalData) {
                        const newProvider = new ListProviderLocalData(prequelId, entry.provider);
                        newProvider.infoStatus = ProviderInfoStatus.ONLY_ID;
                        if (entry.targetSeason !== undefined) {
                            newProvider.targetSeason = entry.targetSeason - 1;
                        }
                        newProvider.sequelIds.push(entry.id as number);
                        await series.addProviderDatas(newProvider);
                    } else if (entry instanceof InfoProviderLocalData) {
                        const newProvider = new InfoProviderLocalData(prequelId, entry.provider);
                        newProvider.infoStatus = ProviderInfoStatus.ONLY_ID;
                        if (entry.targetSeason !== undefined) {
                            newProvider.targetSeason = entry.targetSeason - 1;
                        }
                        newProvider.sequelIds.push(entry.id as number);
                        await series.addProviderDatas(newProvider);
                    } else {
                        continue;

                    }
                    result.push(series);
                }
            }
        }
        logger.info('[SeasonHelper] info' + result.length + ' created temp series');
        return result;
    }
}

export default new SeasonHelper();
