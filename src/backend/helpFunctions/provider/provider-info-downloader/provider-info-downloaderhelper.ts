import ExternalProvider from '../../../api/provider/external-provider';
import MultiProviderResult from '../../../api/provider/multi-provider-result';
import MainListManager from '../../../controller/main-list-manager/main-list-manager';
import { MediaType } from '../../../controller/objects/meta/media-type';
import Name from '../../../controller/objects/meta/name';
import Season from '../../../controller/objects/meta/season';
import Series from '../../../controller/objects/series';
import ProviderDataListSearcher from '../../../controller/provider-data-list-manager/provider-data-list-searcher';
import { InfoProviderLocalData } from '../../../controller/provider-manager/local-data/info-provider-local-data';
import ProviderLocalData from '../../../controller/provider-manager/local-data/interfaces/provider-local-data';
import { ListProviderLocalData } from '../../../controller/provider-manager/local-data/list-provider-local-data';
import ProviderSearchResultManager from '../../../controller/stats-manager/models/provider-search-result-manager';
import logger from '../../../logger/logger';
import { AbsoluteResult } from '../../comperators/comperator-results.ts/comperator-result';
import MediaTypeComperator from '../../comperators/media-type-comperator';
import MultiProviderComperator from '../../comperators/multi-provider-results-comperator';
import ProviderComperator from '../../comperators/provider-comperator';
import SeasonComperator from '../../comperators/season-comperator';
import listHelper from '../../list-helper';
import stringHelper from '../../string-helper';
import ProviderDataWithSeasonInfo from './provider-data-with-season-info';
import SameIdAndUniqueId from './same-id-and-unique-id';
import SearchResultRatingContainer from './search-result-rating-container';
/**
 * Controlls provider request, text search, search result rating, data updates
 */
export default new class ProviderInfoDownloadHelper {
    // ---------------------------------------------------------
    // ! This function below have a big impact on this program !
    // ----------------------------------------------------------

    public async checkListProviderId(a: Series, b: Series): Promise<SameIdAndUniqueId> {
        try {
            for (let aProvider of a.getListProvidersInfos()) {
                for (const bProvider of b.getListProvidersInfos()) {
                    if (await ProviderComperator.simpleProviderSameIdAndSameSeasonCheckWithSeries([aProvider], [bProvider], a, b)) {
                        aProvider = Object.assign(new ListProviderLocalData(aProvider.id), aProvider);
                        return new SameIdAndUniqueId(true, aProvider.getProviderInstance().hasUniqueIdForSeasons);
                    }
                }
            }
        } catch (err) {
            logger.error('[ERROR] [ProviderInfoDownloadHelper] [checkListProviderId]:');
            logger.error(err);
        }
        return new SameIdAndUniqueId();
    }

    // tslint:disable-next-line: max-line-length
    public async getProviderSeriesInfo(series: Series, provider: ExternalProvider): Promise<MultiProviderResult> {
        if (await provider.isProviderAvailable()) {
            const requestId = stringHelper.randomString(5);
            let trys = 0;
            const seriesMediaType = await series.getMediaType();

            const allLocalProviders = series.getAllProviderLocalDatas();
            const indexOfCurrentProvider = allLocalProviders.findIndex((x) => x.provider === provider.providerName);
            if (indexOfCurrentProvider === -1) {
                if (seriesMediaType === MediaType.UNKOWN || provider.supportedMediaTypes.includes(seriesMediaType)) {
                    try {
                        const linkResult = await this.linkProviderDataFromRelations(series, provider);
                        return new MultiProviderResult(linkResult);
                    } catch (err) { logger.debug(err); }

                    const alreadySearchedNames: string[] = [];
                    const names = await this.getNamesSortedBySearchAbleScore(series);
                    for (const name of names) {
                        const alreadySearchedName = alreadySearchedNames.findIndex((x) => name.name === x) !== -1;
                        if (!alreadySearchedName && name.name) {
                            if (trys > 9) {
                                break;
                            }
                            trys++;
                            try {
                                const result = await this.getProviderLocalDataByName(series, name, provider);
                                if (result) {
                                    logger.log('info', '[' + requestId + '][' + provider.providerName + '] ByName Request success 🎉');
                                    return result;
                                }
                            } catch (err) {
                                logger.error(err);
                            }
                            logger.warn('[' + requestId + '][' + provider.providerName + '] ByName Request failed. try next...');

                            alreadySearchedNames.push(name.name);
                        }
                        logger.warn('info', '[' + requestId + '][' + provider.providerName + '] ByName Request failed. ❌');
                    }
                } else {
                    throw new Error('[' + requestId + '][' + provider.providerName + ']' + 'MediaType not supported: .' + seriesMediaType);
                }
            } else {
                try {
                    const result = await provider.getFullInfoById(allLocalProviders[indexOfCurrentProvider] as InfoProviderLocalData);
                    logger.log('info', '[' + requestId + '][' + provider.providerName + '] ID Request success 🎉');
                    const id = result.mainProvider.providerLocalData.id.toString();
                    // tslint:disable-next-line: max-line-length
                    ProviderSearchResultManager.addNewSearchResult(1, requestId, trys, provider.providerName, new Name('id', 'id'), true, seriesMediaType, id);
                    return result;
                } catch (err) {
                    throw new Error('[' + provider.providerName + '] Unkown error: ' + err);
                }
            }

            logger.warn('[' + requestId + '][' + provider.providerName + '] Request failed ❌❌❌❌❌❌');
            throw new Error('[' + requestId + '][' + provider.providerName + ']' + 'No series info found by names.');
        }
        throw new Error('[' + provider.providerName + '] Provider is not available!');
    }

    private async linkProviderDataFromRelations(series: Series, provider: ExternalProvider): Promise<ProviderDataWithSeasonInfo> {
        if (!provider.hasUniqueIdForSeasons) {
            const relations = await series.getAllRelations(await MainListManager.getMainList());
            if (relations.length !== 0) {
                for (const relation of relations) {
                    try {
                        const allBindings = relation.getAllProviderBindings();
                        const result = allBindings.find((x) => x.providerName === provider.providerName);
                        if (result) {
                            const seriesSeason = (await series.getSeason());
                            const mediaType = await series.getMediaType();

                            if (seriesSeason.isSeasonNumberPresent()) {
                                const providerData = ProviderDataListSearcher.getOneBindedProvider(result);
                                if (MediaTypeComperator.areTheseMediaTypeBothNormalSeries(mediaType, providerData.mediaType)
                                    || this.hasProviderLocalDataSeasonTargetInfos(providerData, seriesSeason)) {
                                    if (providerData instanceof ListProviderLocalData) {
                                        return new ProviderDataWithSeasonInfo(providerData, seriesSeason);
                                    } else if (providerData instanceof InfoProviderLocalData) {
                                        return new ProviderDataWithSeasonInfo(providerData, seriesSeason);
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        logger.error(err);
                    }
                }
            }
        }
        throw new Error('no result');
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
        let names = series.getAllNames();
        names = names.sort((a, b) => Name.getSearchAbleScore(b, names) - Name.getSearchAbleScore(a, names));
        try {
            // Test
            names.unshift(new Name(stringHelper.cleanString(names[0].name), names[0].lang + 'clean', names[0].nameType));
        } catch (err) {
            logger.error('[ERROR] [ProviderHelper] [getNamesSortedBySearchAbleScore]:');
            logger.debug(err);
        }
        return listHelper.getLazyUniqueStringList(names);
    }

    /**
     * Search provider update by the series name.
     * It will also check other meta data if they match.
     * @param series Series with valid meta data.
     * @param name Searched name.
     * @param provider In this provider the search will be performed.
     */
    private async getProviderLocalDataByName(series: Series, name: Name, provider: ExternalProvider): Promise<MultiProviderResult> {
        let searchResult: MultiProviderResult[] = [];
        let resultContainer: SearchResultRatingContainer[] = [];
        const season = await series.getSeason();
        if (!season.seasonNumber || season.seasonNumber === 1 || provider.hasUniqueIdForSeasons) {
            logger.log('info', '[' + provider.providerName + '] Request (Search series info by name) with value: ' + name.name + ' | S' + season.seasonNumber);
            searchResult = await provider.getMoreSeriesInfoByName(name.name, season.seasonNumber);

            if (searchResult && searchResult.length !== 0) {
                logger.debug('[' + provider.providerName + '] Results: ' + searchResult.length);
                for (const result of searchResult) {
                    const mpcr = await MultiProviderComperator.compareMultiProviderWithSeries(series, result);
                    resultContainer.push(new SearchResultRatingContainer(mpcr, result));
                }
                if (resultContainer.length !== 0) {
                    resultContainer = resultContainer.sort((a, b) => b.resultRating.matches - a.resultRating.matches);
                    for (const containerItem of resultContainer) {
                        if (containerItem.resultRating.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE) {
                            const id = containerItem.result.mainProvider.providerLocalData.id.toString();
                            const mediaType = await series.getMediaType();
                            const providerName = provider.providerName;
                            ProviderSearchResultManager.addNewSearchResult(searchResult.length, 'requestId', 0, providerName, name, true, mediaType, id);
                            return containerItem.result;
                        }
                    }
                    for (const containerItem of resultContainer) {
                        if (containerItem.resultRating.isAbsolute !== AbsoluteResult.ABSOLUTE_FALSE) {
                            logger.log('info', '[' + provider.providerName + '] Request success 🎉');
                            const id = containerItem.result.mainProvider.providerLocalData.id.toString();
                            const mediaType = await series.getMediaType();
                            const providerName = provider.providerName;
                            ProviderSearchResultManager.addNewSearchResult(searchResult.length, 'requestId', 0, providerName, name, true, mediaType, id);
                            return containerItem.result;
                        }
                    }
                }
            } else {
                logger.warn('[' + provider.providerName + '] No results to name: ' + name.name);
            }
        } else {
            logger.warn('[' + provider.providerName + '] Season number problem. On name: ' + name.name + ' SeasonNumber: ' + season.seasonNumber);
        }
        throw new Error('[' + provider.providerName + '] [getSeriesByName]: No result with the name: ' + name.name);
    }

}();

