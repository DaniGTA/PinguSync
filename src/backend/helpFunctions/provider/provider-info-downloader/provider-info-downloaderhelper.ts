import ExternalProvider from '../../../api/provider/external-provider';
import MultiProviderResult from '../../../api/provider/multi-provider-result';
import ListController from '../../../controller/list-controller';
import { MediaType } from '../../../controller/objects/meta/media-type';
import Name from '../../../controller/objects/meta/name';
import Series from '../../../controller/objects/series';
import { InfoProviderLocalData } from '../../../controller/provider-manager/local-data/info-provider-local-data';
import { ProviderInfoStatus } from '../../../controller/provider-manager/local-data/interfaces/provider-info-status';
import ProviderLocalData from '../../../controller/provider-manager/local-data/interfaces/provider-local-data';
import { ListProviderLocalData } from '../../../controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../controller/provider-manager/provider-list';
import ProviderNameManager from '../../../controller/provider-manager/provider-name-manager';
import ProviderSearchResultManager from '../../../controller/stats-manager/models/provider-search-result-manager';
import logger from '../../../logger/logger';
import { AbsoluteResult } from '../../comperators/comperator-results.ts/comperator-result';
import MultiProviderComperator from '../../comperators/multi-provider-results-comperator';
import ProviderComperator from '../../comperators/provider-comperator';
import listHelper from '../../list-helper';
import stringHelper from '../../string-helper';
import timeHelper from '../../time-helper';
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
                    if (await ProviderComperator.simpleProviderSameIdAndSameSeasonCheckWithSeries([aProvider], [bProvider])) {
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

    public async getProviderSeriesInfo(series: Series, provider: ExternalProvider, target: ProviderInfoStatus = ProviderInfoStatus.FULL_INFO): Promise<MultiProviderResult> {
        if (await provider.isProviderAvailable()) {
            const requestId = stringHelper.randomString(5);
            let trys = 0;
            const seriesMediaType = await series.getMediaType();

            const allLocalProviders = series.getAllProviderLocalDatas();
            const indexOfCurrentProvider = allLocalProviders.findIndex((x) => x.provider === provider.providerName);
            if (indexOfCurrentProvider === -1) {
                if (seriesMediaType === MediaType.UNKOWN || provider.supportedMediaTypes.includes(seriesMediaType)) {
                    const alreadySearchedNames: string[] = [];
                    const names = await this.getNamesSortedBySearchAbleScore(series);
                    for (const name of names) {
                        const alreadySearchedName = alreadySearchedNames.findIndex((x) => name.name === x) !== -1;
                        if (!alreadySearchedName && name.name) {
                            if (trys > 9) {
                                break;
                            }
                            trys++;

                            const result = await this.getProviderLocalDataByName(series, name, provider);
                            if (result) {
                                logger.log('info', '[' + requestId + '][' + provider.providerName + '] ByName Request success 🎉');
                                return result;
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
                const result = await provider.getFullInfoById(allLocalProviders[indexOfCurrentProvider] as InfoProviderLocalData);
                logger.log('info', '[' + requestId + '][' + provider.providerName + '] ID Request success 🎉');
                // tslint:disable-next-line: max-line-length
                ProviderSearchResultManager.addNewSearchResult(1, requestId, trys, provider.providerName, new Name('id', 'id'), true, seriesMediaType, result.mainProvider.id.toString());
                return result;
            }

            logger.warn('[' + requestId + '][' + provider.providerName + '] Request failed ❌❌❌❌❌❌');
            throw new Error('[' + requestId + '][' + provider.providerName + ']' + 'No series info found by names.');
        }
        throw new Error('[' + provider.providerName + '] Provider is not available!');
    }

    /**
     * Fill missing providers in a Series.
     * It wold not update a provider
     */
    /*
    public async fillListProvider(entry: Series, forceUpdate = false, target: ProviderInfoStatus = ProviderInfoStatus.FULL_INFO): Promise<Series> {
        const providerList = ProviderList.getListProviderList();
        for (const provider of providerList) {
            try {
                let result;
                // Check if anime exist in main list and have already all providers in.
                if (ListController.instance) {
                    const mainListEntry = await ListController.instance.checkIfProviderExistInMainList(entry, provider);
                    if (mainListEntry) {
                        const mainListResult = mainListEntry.getListProvidersInfos().find((x) => x.provider === provider.providerName);
                        if (mainListResult && mainListResult.version === provider.version && this.shouldUpdateProvider(mainListResult.infoStatus)) {
                            continue;
                        } else if (!mainListResult) { 
                            try {
                                const subProviderProvider = await this.getSubProviderProvider(provider, mainListEntry);
                                entry = await this.getProviderSeriesInfo(mainListEntry, subProviderProvider);
                            } catch (err) { }
                        } else {
                            entry = mainListEntry;
                        }
                    }
                } else {
                    logger.warn('[ProviderHelper] [fillListProvider]: Failed get main list entry: no list controller instance');
                }

                try {
                    result = entry.getListProvidersInfos().find((x) => x.provider === provider.providerName);
                } catch (err) {
                    logger.error('[ERROR] [ProviderHelper] [fillListProvider]:');
                    logger.error(err);
                }
                if (result) {
                    if (target > result.infoStatus || forceUpdate) {
                        entry = await this.getProviderSeriesInfo(entry, provider);
                        await timeHelper.delay(700);
                    }
                } else {
                    entry = await this.getProviderSeriesInfo(entry, provider);
                }
            } catch (err) {
                continue;
            }
        }
        return entry;
    }*/

    private async getSubProviderProvider(searchedProvider: ExternalProvider, series: Series): Promise<ExternalProvider> {
        const providerList = ProviderList.getListProviderList();
        for (const provider2 of providerList) {
            if (provider2.providerName !== searchedProvider.providerName) {
                for (const subProvider of provider2.potentialSubProviders) {
                    const subProviderName = ProviderNameManager.getProviderName(subProvider);
                    if (subProviderName === searchedProvider.providerName) {
                        const checkCurrentResult = series.getListProvidersInfos().find((x) => x.provider === searchedProvider.providerName);
                        if (checkCurrentResult && checkCurrentResult.infoStatus !== ProviderInfoStatus.FULL_INFO) {
                            const result = providerList.find(x => x.providerName === checkCurrentResult.provider);
                            if (result) {
                                return result;
                            }
                        }
                    }
                }
            }
        }
        throw new Error('No SubProviderAvaible');
    }

    /** Checks if it should update.
     *  We only need to update when we have no info about the provider.
     */
    private shouldUpdateProvider(infoStatus: ProviderInfoStatus): boolean {
        switch (infoStatus) {
            case ProviderInfoStatus.BASIC_INFO:
                return false;
            case ProviderInfoStatus.FULL_INFO:
                return false;
            case ProviderInfoStatus.ONLY_ID:
                return true;
            default:
                return false;
        }
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
            names.unshift(new Name(await stringHelper.cleanString(names[0].name), names[0].lang + 'clean', names[0].nameType));
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
                            // tslint:disable-next-line: max-line-length
                            ProviderSearchResultManager.addNewSearchResult(searchResult.length, 'requestId', 0, provider.providerName, name, true, await series.getMediaType(), containerItem.result.mainProvider.id.toString());
                            return containerItem.result;
                        }
                    }
                    for (const containerItem of resultContainer) {
                        if (containerItem.resultRating.isAbsolute !== AbsoluteResult.ABSOLUTE_FALSE) {
                            logger.log('info', '[' + provider.providerName + '] Request success 🎉');
                            // tslint:disable-next-line: max-line-length
                            ProviderSearchResultManager.addNewSearchResult(searchResult.length, 'requestId', 0, provider.providerName, name, true, await series.getMediaType(), containerItem.result.mainProvider.id.toString());
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

