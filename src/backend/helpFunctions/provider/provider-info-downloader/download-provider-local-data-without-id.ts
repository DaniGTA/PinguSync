import ExternalInformationProvider from '../../../api/provider/external-information-provider';
import MultiProviderResult from '../../../api/provider/multi-provider-result';
import MainListManager from '../../../controller/main-list-manager/main-list-manager';
import { FailedRequestError } from '../../../controller/objects/meta/failed-request';
import Name from '../../../controller/objects/meta/name';
import Season from '../../../controller/objects/meta/season';
import Series from '../../../controller/objects/series';
import ProviderDataListSearcher from '../../../controller/provider-controller/provider-data-list-manager/provider-data-list-searcher';
import { InfoProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import { ListProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import logger from '../../../logger/logger';
import { AbsoluteResult } from '../../comperators/comperator-results.ts/comperator-result';
import MediaTypeComperator from '../../comperators/media-type-comperator';
import MultiProviderComperator from '../../comperators/multi-provider-results-comperator';
import SeasonComperator from '../../comperators/season-comperator';
import listHelper from '../../list-helper';
import MediaTypeHelper from '../../media-type-helper';
import TitleHelper from '../../name-helper/title-helper';
import StringHelper from '../../string-helper';
import DownloadSettings from './download-settings';
import ProviderLocalDataWithSeasonInfo from './provider-data-with-season-info';
import SearchResultRatingContainer from './search-result-rating-container';

export default class DownloadProviderLocalDataWithoutId {
    private series: Series;
    private provider: ExternalInformationProvider;
    private requestId: string;

    constructor(series: Series, provider: ExternalInformationProvider) {
        this.series = series;
        this.provider = provider;
        this.requestId = '';
    }

    public async download(): Promise<MultiProviderResult> {
        const seriesMediaType = await this.series.getMediaType();
        let result: MultiProviderResult | undefined;
        if (MediaTypeHelper.providerSupportMediaType(this.provider, seriesMediaType)) {
            result = await this.getProviderSeriesInfoByRelation();
            if (result) {
                return result;
            }

            result = await this.getProviderSeriesInfoBySeriesName();
            if (result) {
                return result;
            } else {
                throw FailedRequestError.ProviderNoResult;
            }
        } else {
            throw new Error(`[${this.requestId}][${this.provider.providerName}]MediaType not supported: .${seriesMediaType}`);
        }
    }

    public async downloadProviderSeriesInfoBySeriesName(names: Name[]): Promise<MultiProviderResult | undefined> {
        let trys = 0;
        const alreadySearchedNames: string[] = [];
        for (const name of names) {
            if (!this.provider.supportOnlyBasicLatinForNameSearch ||
                (this.provider.supportOnlyBasicLatinForNameSearch && StringHelper.isOnlyBasicLatin(name.name))) {
                const alreadySearchedName = alreadySearchedNames.findIndex((x) => name.name === x) !== -1;
                if (!alreadySearchedName && name.name) {
                    if (trys > DownloadSettings.MAX_RETRYS_FOR_NAME_SEARCH) {
                        break;
                    }
                    trys++;
                    try {
                        const result = await this.getProviderLocalDataByName(name);
                        if (result) {
                            logger.log('info', `[${this.requestId}][${this.provider.providerName}] ByName ${name.name} Request success 🎉`);
                            return result;
                        }
                    } catch (err) {
                        logger.error('Error at ProviderInfoDownloadHelper.getProviderSeriesInfo');
                        logger.error(err);
                        if (!isNaN(err) && err !== FailedRequestError.ProviderNoResult) {
                            throw err;
                        }
                    }
                    logger.warn(`[${this.requestId}][${this.provider.providerName}] ByName ${name.name} Request failed. try next...`);

                    alreadySearchedNames.push(name.name);
                }
            }
            logger.warn(`[${this.requestId}][${this.provider.providerName}] ByName ${name.name} Request failed. ❌`);
        }
        throw FailedRequestError.ProviderNoResult;
    }

    private async getProviderSeriesInfoByRelation(): Promise<MultiProviderResult | undefined> {
        try {
            const linkResult = await this.linkProviderDataFromRelations();
            return new MultiProviderResult(linkResult);
        } catch (err) { logger.debug(err); }
    }

    private async getProviderSeriesInfoBySeriesName(): Promise<MultiProviderResult | undefined> {
        const names = await this.getNamesSortedBySearchAbleScore(this.series);
        return this.downloadProviderSeriesInfoBySeriesName(names);
    }

    private async linkProviderDataFromRelations(): Promise<ProviderLocalDataWithSeasonInfo> {
        if (!this.provider.hasUniqueIdForSeasons) {
            const relations = await this.series.getAllRelations(MainListManager.getMainList());
            if (relations.length !== 0) {
                for (const relation of relations) {
                    try {
                        const allBindings = relation.getAllProviderBindings();
                        const result = allBindings.find((x) => x.providerName === this.provider.providerName);
                        if (result) {
                            const [seriesSeason, mediaType] = await Promise.all([this.series.getSeason(), this.series.getMediaType()]);
                            if (seriesSeason.isSeasonNumberPresent()) {
                                const providerData = ProviderDataListSearcher.getOneBindedProvider(result);
                                if (MediaTypeComperator.areTheseMediaTypeBothNormalSeries(mediaType, providerData.mediaType)
                                    || this.hasProviderLocalDataSeasonTargetInfos(providerData, seriesSeason)) {
                                    if (providerData instanceof ListProviderLocalData) {
                                        return new ProviderLocalDataWithSeasonInfo(providerData, seriesSeason);
                                    } else if (providerData instanceof InfoProviderLocalData) {
                                        return new ProviderLocalDataWithSeasonInfo(providerData, seriesSeason);
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        logger.error('Error at ProviderInfoDownloadHelper.linkProviderDataFromRelations');
                        logger.error(err);
                    }
                }
            }
        }
        throw new Error(`no result found in: linkProviderDataFromRelations for provider: ${this.provider.providerName}`);
    }


    private hasProviderLocalDataSeasonTargetInfos(provider: ProviderLocalData, seasonTarget: Season): boolean {
        for (const episode of provider.detailEpisodeInfo) {
            // tslint:disable-next-line: triple-equals
            if (SeasonComperator.isSameSeason(episode.season, seasonTarget)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get all names of a series sorted by a score and it is unique say all double entrys will be filtered out.
     * @param series The series from which the names will be taken.
     */
    private async getNamesSortedBySearchAbleScore(series: Series): Promise<Name[]> {
        let names = series.getAllNamesSeasonAware();
        logger.debug(`[INFO] [ProviderInfoDownloadHelper] [getNamesSortedBySearchAbleScore] start sorting ${names.length} names by search able score.`);
        names = TitleHelper.getAllNamesSortedBySearchAbleScore(names);
        if (names.length !== 0) {
            try {
                // Test
                names.unshift(new Name(StringHelper.cleanString(names[0].name), names[0].lang + 'clean', names[0].nameType));
            } catch (err) {
                logger.debug('[ERROR] [ProviderInfoDownloadHelper] [getNamesSortedBySearchAbleScore]:');
                logger.debug(err);
            }
            return listHelper.getLazyUniqueStringList(names);
        } else {
            return [];
        }
    }

    /**
     * Search provider update by the series name.
     * It will also check other meta data if they match.
     * @param series Series with valid meta data.
     * @param name Searched name.
     * @param provider In this provider the search will be performed.
     */
    private async getProviderLocalDataByName(name: Name): Promise<MultiProviderResult> {
        const season = await this.series.getSeason();
        if (season.seasonNumbers.length === 0 || season.getSingleSeasonNumberAsNumber() === 1 || this.provider.hasUniqueIdForSeasons) {
            logger.log('info', `[${this.provider.providerName}] Request (Search series info by name) with value: ${name.name} | S${season.seasonNumbers}`);
            const result = await this.getMoreSeriesInfoByNameResults(name, season);
            if (result) {
                return result;
            }
        } else {
            logger.warn(`[${this.provider.providerName}] Season number problem. On name: ${name.name} SeasonNumber: ${season.seasonNumbers}`);
        }
        throw FailedRequestError.ProviderNoResult;
    }

    private async getMoreSeriesInfoByNameResults(name: Name, season: Season): Promise<undefined | MultiProviderResult> {
        let searchResult: MultiProviderResult[] = [];
        const seasonNumber = season.getSingleSeasonNumberAsNumber();
        if (!await this.provider.isProviderAvailable()) {
            throw FailedRequestError.ProviderNotAvailble;
        }
        if (this.provider.requireInternetAccessGetMoreSeriesInfoByName) {
            await this.provider.waitUntilItCanPerfomNextRequest();
        }
        searchResult = await Promise.race(
            [
                DownloadSettings.requestTimoutPromise<MultiProviderResult[]>(),
                this.provider.getMoreSeriesInfoByName(name.name, seasonNumber),
            ]);
        return this.processResultsOfGetMoreSeriesInfoByName(searchResult);
    }


    private async processResultsOfGetMoreSeriesInfoByName(searchResult: MultiProviderResult[]): Promise<undefined | MultiProviderResult> {
        const resultContainer: SearchResultRatingContainer[] = [];
        if (searchResult && searchResult.length !== 0) {
            logger.debug(`[${this.provider.providerName}] Results: ${searchResult.length}`);
            for (const result of searchResult) {
                const mpcr = await MultiProviderComperator.compareMultiProviderWithSeries(this.series, result);
                if (mpcr.isAbsolute !== AbsoluteResult.ABSOLUTE_FALSE) {
                    resultContainer.push(new SearchResultRatingContainer(mpcr, result));
                }
            }
            if (resultContainer.length !== 0) {
                const bestResult = this.getBestResultOutOfSearchResultRatingContainer(resultContainer);
                if (bestResult) {
                    logger.log('info', `[${this.provider.providerName}] Request success 🎉`);
                    return bestResult.result;
                }
            }
        }
    }

    private getBestResultOutOfSearchResultRatingContainer(searchResultRatingContainer: SearchResultRatingContainer[]): SearchResultRatingContainer | undefined {
        let bestSearchResult: SearchResultRatingContainer | undefined;

        searchResultRatingContainer = this.sortBestResultRatingContainer(searchResultRatingContainer);

        if (searchResultRatingContainer.length !== 0) {
            for (const searchResultRating of searchResultRatingContainer) {
                if (searchResultRating.resultRating.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE) {
                    return searchResultRating;
                }
                if (bestSearchResult === undefined || this.hasSearchResultABetterMatchesThenB(searchResultRating, bestSearchResult)) {
                    bestSearchResult = searchResultRating;
                }
            }
        }

        const bestSearchResultCount = searchResultRatingContainer.filter((x) => x.resultRating.matches === bestSearchResult?.resultRating.matches).length;
        if (bestSearchResultCount !== 1) {
            return;
        }
        return bestSearchResult;
    }

    private sortBestResultRatingContainer(searchResultRatingContainer: SearchResultRatingContainer[]): SearchResultRatingContainer[] {
        return searchResultRatingContainer.sort((a, b) => b.resultRating.matches - a.resultRating.matches);

    }

    private hasSearchResultABetterMatchesThenB(searchResultA: SearchResultRatingContainer, searchResultB: SearchResultRatingContainer): boolean {
        return (searchResultA.resultRating.matches > searchResultB.resultRating.matches &&
            searchResultA.resultRating.isAbsolute !== AbsoluteResult.ABSOLUTE_FALSE);
    }
}
