import IExternalProvider from '../../api/provider/external-provider';
import MultiProviderResult from '../../api/provider/multi-provider-result';
import ListController from '../../controller/list-controller';
import { MediaType } from '../../controller/objects/meta/media-type';
import Name from '../../controller/objects/meta/name';
import Series from '../../controller/objects/series';
import { InfoProviderLocalData } from '../../controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../controller/provider-manager/provider-list';
import ProviderSearchResultManager from '../../controller/stats-manager/models/provider-search-result-manager';
import logger from '../../logger/logger';
import { AbsoluteResult } from '../comperators/comperator-results.ts/comperator-result';
import MultiProviderComperator from '../comperators/multi-provider-results-comperator';
import ProviderComperator from '../comperators/provider-comperator';
import listHelper from '../list-helper';
import stringHelper from '../string-helper';
import timeHelper from '../time-helper';
import SameIdAndUniqueId from './same-id-and-unique-id';
import SearchResultRatingContainer from './search-result-rating-container';
/**
 * Controlls provider request, text search, search result rating, data updates
 */
export default new class ProviderHelper {
    // ---------------------------------------------------------
    // ! This function below have a big impact on this program !
    // ----------------------------------------------------------

    public async checkListProviderId(a: Series, b: Series): Promise<SameIdAndUniqueId> {
        try {
            for (let aProvider of a.getListProvidersInfos()) {
                for (const bProvider of b.getListProvidersInfos()) {
                    if (ProviderComperator.simpleProviderSameIdAndSameSeasonCheckWithSeries([aProvider], [bProvider])) {
                        aProvider = Object.assign(new ListProviderLocalData(aProvider.id), aProvider);
                        return new SameIdAndUniqueId(true, aProvider.getProviderInstance().hasUniqueIdForSeasons);
                    }
                }
            }
        } catch (err) {
            logger.log('info', err);
        }
        return new SameIdAndUniqueId();
    }

    public async getProviderSeriesInfo(series: Series, provider: IExternalProvider): Promise<Series> {
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

                            const result = await this.getSeriesByName(series, name, provider);
                            if (result) {
                                logger.log('info', '[' + requestId + '][' + provider.providerName + '] ByName Request success 🎉');
                                return result;
                            }
                            logger.log('info', '[' + requestId + '][' + provider.providerName + '] ByName Request failed ❌');

                            alreadySearchedNames.push(name.name);
                        }
                    }
                }
            } else {
                const result = await provider.getFullInfoById(allLocalProviders[indexOfCurrentProvider] as InfoProviderLocalData);
                logger.log('info', '[' + requestId + '][' + provider.providerName + '] ID Request success 🎉');
                ProviderSearchResultManager.addNewSearchResult(1, requestId, trys, provider.providerName, new Name('id', 'id'), true, seriesMediaType, result.mainProvider.id.toString());
                await series.addProviderDatas(result.mainProvider, ...result.subProviders);
                return series;
            }

            logger.log('info', '[' + requestId + '][' + provider.providerName + '] Request failed ❌❌❌❌❌❌');
            throw new Error('no series info found by name');
        }
        throw new Error('provider is not available');
    }

    /**
     * Fill missing providers in a Series.
     * It wold not update a provider
     */
    public async fillListProvider(entry: Series, forceUpdate = false): Promise<Series> {
        entry = Object.assign(new Series(), entry);
        if (entry.getListProvidersInfos().length !== ProviderList.getListProviderList().length || forceUpdate) {
            for (const provider of ProviderList.getListProviderList()) {
                try {
                    let result;
                    // Check if anime exist in main list and have already all providers in.
                    if (ListController.instance) {
                        const mainListEntry = await ListController.instance.checkIfProviderExistInMainList(entry, provider);
                        if (mainListEntry) {
                            const mainListResult = mainListEntry.getListProvidersInfos().find((x) => x.provider === provider.providerName);
                            if (mainListResult && mainListResult.version === provider.version && mainListResult.hasFullInfo) {
                                continue;
                            } else {
                                entry = mainListEntry;
                            }
                        }
                    } else {
                        logger.log('info', 'Failed get main list entry: no list controller instance');
                    }

                    try {
                        result = entry.getListProvidersInfos().find((x) => x.provider === provider.providerName);
                    } catch (err) { }
                    if (result || forceUpdate) {
                        entry = await this.getProviderSeriesInfo(entry, provider);
                        await timeHelper.delay(700);
                    } else {
                        entry = await this.getProviderSeriesInfo(entry, provider);
                    }
                } catch (err) {
                    continue;
                }
            }
        }
        return entry;
    }

    /**
     * This will get info from all Providers that are avaible in this programm.
     * There is a timelimit how long the data is valid.
     * If the data isnt anymore valid they will be refresht.
     *
     * If the Series have no names this function will prepare the Series for the full search.
     * @param entry the Series that should be update with all provider.
     * @param forceUpdate Ignore the timelimit and force a update.
     * @param offlineOnly Dont attampt to request online providers and run only providers that work offline.
     */
    public async fillMissingProvider(entry: Series, forceUpdate = false, offlineOnly = false): Promise<Series> {
        if (new Date().getTime() - entry.lastInfoUpdate > new Date(0).setHours(1920) || forceUpdate) {
            entry = await this.prepareRequiermentsForFillMissingProvider(entry);
            entry = await this.updateInfoProviderData(entry);
            if (!offlineOnly) {
                try {
                    entry = await this.fillListProvider(entry);
                } catch (err) {
                    logger.error(err);
                }
                entry.lastInfoUpdate = Date.now();
            }
        }
        return entry;
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
        } catch (err) { }
        return listHelper.getLazyUniqueStringList(names);
    }

    /**
     * Search provider update by the series name.
     * It will also check other meta data if they match.
     * @param series Series with valid meta data.
     * @param name Searched name.
     * @param provider In this provider the search will be performed.
     */
    private async getSeriesByName(series: Series, name: Name, provider: IExternalProvider): Promise<Series> {
        let searchResult: MultiProviderResult[] = [];
        let resultContainer: SearchResultRatingContainer[] = [];
        const season = await series.getSeason();
        if (!season.seasonNumber || season.seasonNumber === 1 || provider.hasUniqueIdForSeasons) {
            logger.log('info', '[' + provider.providerName + '] Request (Search series info by name) with value: ' + name.name + ' | S' + season.seasonNumber);
            searchResult = await provider.getMoreSeriesInfoByName(name.name, season.seasonNumber);

            if (searchResult && searchResult.length !== 0) {
                logger.log('info', '[' + provider.providerName + '] Results: ' + searchResult.length);
                for (const result of searchResult) {
                    const mpcr = await MultiProviderComperator.compareMultiProviderWithSeries(series, result);
                    resultContainer.push(new SearchResultRatingContainer(mpcr, result));
                }
                if (resultContainer.length !== 0) {
                    resultContainer = resultContainer.sort((a, b) => b.resultRating.matches - a.resultRating.matches);
                    for (const containerItem of resultContainer) {
                        if (containerItem.resultRating.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE) {
                            ProviderSearchResultManager.addNewSearchResult(searchResult.length, 'requestId', 0, provider.providerName, name, true, await series.getMediaType(), containerItem.result.mainProvider.id.toString());
                            await series.addProviderDatas(containerItem.result.mainProvider, ...containerItem.result.subProviders);
                            return series;
                        }
                    }
                    for (const containerItem of resultContainer) {
                        if (containerItem.resultRating.isAbsolute !== AbsoluteResult.ABSOLUTE_FALSE) {
                            logger.log('info', '[' + provider.providerName + '] Request success 🎉');
                            ProviderSearchResultManager.addNewSearchResult(searchResult.length, 'requestId', 0, provider.providerName, name, true, await series.getMediaType(), containerItem.result.mainProvider.id.toString());
                            await series.addProviderDatas(containerItem.result.mainProvider, ...containerItem.result.subProviders);
                            return series;
                        }
                    }
                }
            } else {
                logger.warn('no results');
            }
        } else {
            logger.warn('[' + provider.providerName + '] ');
        }
        throw null;
    }

    /**
     * If the Series have no names this function will request the avaible providers for names and
     * will return the updated provider with the series.
     */
    private async prepareRequiermentsForFillMissingProvider(entry: Series): Promise<Series> {
        if (entry.getAllNames().length === 0) {
            const entryProviders = [...entry.getAllProviderLocalDatas()];
            for (const providerLocalData of entryProviders) {
                entry = await this.getProviderSeriesInfo(entry, ProviderList.getExternalProviderInstance(providerLocalData));
            }
        }
        return entry;
    }

    private async updateInfoProviderData(series: Series, forceUpdate = false, offlineOnly = false): Promise<Series> {
        for (const infoProvider of ProviderList.getInfoProviderList()) {
            if (offlineOnly) {
                if (!infoProvider.isOffline) {
                    continue;
                }
            }
            try {
                const index = series.getInfoProvidersInfos().findIndex((entry) => infoProvider.providerName === entry.provider);
                if (index !== -1) {
                    const provider = series.getInfoProvidersInfos()[index];
                    if (new Date().getTime() - new Date(provider.lastUpdate).getTime() < new Date(0).setHours(72) || forceUpdate) {
                        const data = await this.getProviderSeriesInfo(series, infoProvider);
                        series = await series.merge(data);
                    }
                } else {
                    const data = await this.getProviderSeriesInfo(series, infoProvider);
                    series = await series.merge(data);
                }
            } catch (err) {
                logger.error(err);
            }
        }
        return series;
    }
}();

