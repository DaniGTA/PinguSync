import Series from "../../controller/objects/series";
import SearchSeasonValueResult from "../../controller/objects/transfer/search-season-value-results";
import Name from "../../controller/objects/meta/name";
import ListController from "../../controller/list-controller";
import ProviderLocalData from '../../controller/interfaces/provider-local-data';
import { ListProviderLocalData } from '../../controller/objects/list-provider-local-data';
import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import { SeasonError } from '../../controller/objects/transfer/season-error';
import { SeasonSearchMode } from './season-search-mode';
import SeasonSearchModeHelper from './season-search-mode-helper';

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
     * @param series 
     * @param seriesList 
     */
    async searchSeasonValuePrequelTrace(series: Series, seriesList?: Series[] | readonly Series[]): Promise<SearchSeasonValueResult> {
        console.log('[Season] [Search]: Prequel Trace.'+' ('+ series.id +')')
        let prequel: Series | null = null;
        if (await series.isAnyPrequelPresent() && seriesList) {
            let error = SeasonError.NONE;
            const searchResult = await series.getPrequel(seriesList);
            prequel = searchResult.foundedSeries;
            let searchCount = 0;
            if (searchResult.relationExistButNotFounded) {
                return new SearchSeasonValueResult(-2, "PrequelTraceNotAvaible",SeasonError.SEASON_TRACING_CAN_BE_COMPLETED_LATER, searchResult);
            } else {
                while (prequel) {
                    searchCount++;
                    if (await prequel.getMediaType() === await series.getMediaType()) {
                        const prequelSeason = await prequel.getSeason(SeasonSearchMode.PREQUEL_TRACE_MODE,seriesList);
                        if (prequelSeason.seasonError === SeasonError.SEASON_TRACING_CAN_BE_COMPLETED_LATER) {
                             return new SearchSeasonValueResult(-2, "PrequelTraceNotAvaible",SeasonError.SEASON_TRACING_CAN_BE_COMPLETED_LATER, searchResult);
                        }
                        if (prequelSeason.seasonNumber === 1 || prequelSeason.seasonNumber === 0) {
                            return new SearchSeasonValueResult(prequelSeason.seasonNumber + searchCount, "PrequelTrace");
                        }
                    }
                    if (await prequel.isAnyPrequelPresent()) {

                        const searchResult = await prequel.getPrequel(seriesList);
                        if (searchResult.relationExistButNotFounded) {
                            prequel = null;
                            error = SeasonError.SEASON_TRACING_CAN_BE_COMPLETED_LATER;
                            break;
                        }
                        prequel = searchResult.foundedSeries;
                    } else {
                        return new SearchSeasonValueResult(searchCount, "PrequelTrace - nomore prequel present");
                    }
                }
            }
            return new SearchSeasonValueResult(-2, "PrequelTraceNotAvaible",SeasonError.SEASON_TRACING_CAN_BE_COMPLETED_LATER);
        }
          return new SearchSeasonValueResult(-1, "NoPrequelAvaible",SeasonError.CANT_GET_SEASON);
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
     * @param series 
     * @param seriesList 
     */
    async searchSeasonValueSequelTrace(series: Series, seriesList?: Series[] | readonly Series[]): Promise<SearchSeasonValueResult> {
        console.log('[Season] [Search]: Sequel Trace.'+' ('+ series.id +')')
        let sequel: Series | null = null;
        if (await series.isAnySequelPresent() && seriesList) {
            let error = SeasonError.NONE;
            const searchResult = await series.getSequel(seriesList);
            sequel = searchResult.foundedSeries;
            let searchCount = 0;
            if (searchResult.relationExistButNotFounded) {
                return new SearchSeasonValueResult(-2, "SequelTraceNotAvaible",SeasonError.SEASON_TRACING_CAN_BE_COMPLETED_LATER, searchResult);
            } else {
                while (sequel) {
                    searchCount++;
                    if (await sequel.getMediaType() === await series.getMediaType()) {
                        const sequelSeason = await sequel.getSeason(SeasonSearchMode.SEQUEL_TRACE_MODE, seriesList);
                        if (sequelSeason.seasonError === SeasonError.SEASON_TRACING_CAN_BE_COMPLETED_LATER) {
                             return new SearchSeasonValueResult(-2, "SequelTraceNotAvaible",SeasonError.SEASON_TRACING_CAN_BE_COMPLETED_LATER, searchResult);
                        }
                        if (sequelSeason.seasonNumber != undefined && sequelSeason.seasonError === SeasonError.NONE) {
                            return new SearchSeasonValueResult(sequelSeason.seasonNumber - searchCount, "SequelTrace");
                        }
                    }
                    if (await sequel.isAnySequelPresent()) {

                        const searchResult = await sequel.getSequel(seriesList);
                        if (searchResult.relationExistButNotFounded) {
                            sequel = null;
                            error = SeasonError.SEASON_TRACING_CAN_BE_COMPLETED_LATER;
                            break;
                        }
                        sequel = searchResult.foundedSeries;
                    } else {
                        sequel = null;
                    }
                }
            }
            return new SearchSeasonValueResult(-2, "SequelTraceNotAvaible",SeasonError.SEASON_TRACING_CAN_BE_COMPLETED_LATER);
        }
        return new SearchSeasonValueResult(-1, "NoSequelAvaible",SeasonError.CANT_GET_SEASON);
    }

    async searchSeasonValue(series: Series, searchMode:SeasonSearchMode = SeasonSearchMode.ALL, seriesList?: Series[] | readonly Series[]): Promise<SearchSeasonValueResult> {
        console.log('[Season] [Search]: Season value.' + ' (' + series.id + ') MODE: ' + SeasonSearchMode[searchMode]);
        let prequelResult;
        let sequelResult;

        if (!seriesList && ListController.instance) {
            seriesList = await ListController.instance.getMainList();
        }
        if (SeasonSearchModeHelper.canPerformATitleSearch(searchMode)) {
            const numberFromName = await Name.getSeasonNumber(await series.getAllNamesUnique());

            if (numberFromName) {
                return new SearchSeasonValueResult(numberFromName, "Name");
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
        
        try {
            if (!await series.isAnyPrequelPresent() && await series.isAnySequelPresent()) {
                return new SearchSeasonValueResult(1, "NoPrequelButSequel");
            }
        } catch (err) {
        }

        if (SeasonSearchModeHelper.canPerformAProviderSeasonValueSearch(searchMode)) {
            for (const provider of series.getListProvidersInfos()) {
                if (provider.targetSeason) {
                    return new SearchSeasonValueResult(provider.targetSeason, "Provider: " + provider.provider);
                }
            }
        }

        if (prequelResult && prequelResult.seasonError === SeasonError.SEASON_TRACING_CAN_BE_COMPLETED_LATER) { 
            return prequelResult;
        }

        if(sequelResult && sequelResult.seasonError === SeasonError.SEASON_TRACING_CAN_BE_COMPLETED_LATER) {
            return sequelResult;
        }

        return new SearchSeasonValueResult(-1, "None",SeasonError.CANT_GET_SEASON);
    }

    async createTempSeriesFromPrequels(localDatas: ProviderLocalData[]): Promise<Series[]> {
        const result: Series[] = [];
        console.log('create temp series');
        for (const entry of localDatas) {
            for (const prequelId of entry.prequelIds) {
                if (prequelId) {
                    const series = new Series();
                    //TODO FIX THIS instanceof.
                    if (entry instanceof ListProviderLocalData) {
                        const newProvider = new ListProviderLocalData(entry.provider);
                        newProvider.id = prequelId;
                        newProvider.fullInfo = false;
                        series.addProviderDatas(newProvider);
                    } else if (entry instanceof InfoProviderLocalData) {
                        const newProvider = new InfoProviderLocalData(entry.provider);
                        newProvider.id = prequelId;
                        newProvider.fullInfo = false;
                        series.addProviderDatas(newProvider);
                    } else {
                        continue;

                    }
                    result.push(series);
                }
            }
        }
        console.log(result.length + ' created temp series');
        return result;
    }
}

export default new SeasonHelper();