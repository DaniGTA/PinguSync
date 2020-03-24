import Series from '../../../controller/objects/series';
import ProviderLocalData from '../../../controller/provider-manager/local-data/interfaces/provider-local-data';
import ProviderList from '../../../controller/provider-manager/provider-list';
import logger from '../../../logger/logger';
import ProviderLocalDataWithSeasonInfo from '../provider-info-downloader/provider-data-with-season-info';
import RelationSearchResults from '../../../controller/objects/transfer/relation-search-results';
import { ListProviderLocalData } from '../../../controller/provider-manager/local-data/list-provider-local-data';
import { InfoProviderLocalData } from '../../../controller/provider-manager/local-data/info-provider-local-data';
import EpisodeHelper from '../../episode-helper/episode-helper';
import ProviderHelper from '../provider-helper';

export default class SeasonAwarenessHelper {

    public static isSeasonAware(currentProviders: ProviderLocalDataWithSeasonInfo[]): boolean {
        let result = false;
        for (const provider of currentProviders) {
            try {
                if (SeasonAwarenessHelper.isProviderSeasonAware(provider)) {
                    result = true;
                }
            } catch (err) {
                logger.debug(err);
            }
        }
        return result;
    }

    public static isProviderSeasonAware(provider: ProviderLocalDataWithSeasonInfo) {

        if (!ProviderList.getExternalProviderInstance(provider.providerLocalData).hasUniqueIdForSeasons && !(provider.seasonTarget?.seasonNumbers.includes(1))) {
            return false;
        }
        return true;
    }

    public static getOtherProvidersWithSeasonAwareness(series: Series, filterOut: ProviderLocalData): ProviderLocalData[] {
        const collectedProviders: ProviderLocalData[] = [];
        const allProviders = series.getAllProviderLocalDatas();
        for (const providerLocalData of allProviders) {
            if (providerLocalData.provider !== filterOut.provider) {
                try {
                    if (ProviderList.getExternalProviderInstance(providerLocalData).hasEpisodeTitleOnFullInfo) {
                        collectedProviders.push(providerLocalData);
                    }
                } catch (err) {
                    logger.debug(err);
                }
            }
        }
        return collectedProviders;
    }

    public static async createTempPrequelFromRelationSearchResults(searchResult: RelationSearchResults): Promise<Series | undefined> {
        const tempPrequel = new Series();
        const allPrequelProviders = this.getAllProviderWithLocalData(searchResult.searchedProviders);

        if (allPrequelProviders.length !== 0) {
            await tempPrequel.addProviderDatas(...allPrequelProviders);
        }

        if (tempPrequel.getAllProviderBindings().length !== 0) {
            return tempPrequel;
        }
        return undefined;
    }

    public static async createTempPrequelFromLocalData(providerLocalDatas: ProviderLocalData[]): Promise<Series | undefined> {
        const tempPrequel = new Series();
        const allPrequelProviders = this.getAllProviderWithLocalData(providerLocalDatas);

        if (allPrequelProviders.length !== 0) {
            await tempPrequel.addProviderDatas(...allPrequelProviders);
        }

        if (tempPrequel.getAllProviderBindings().length !== 0) {
            return tempPrequel;
        }
        return undefined;
    }

    public static getAllProviderWithLocalData(providerLocalDatas: ProviderLocalData[]): ProviderLocalData[] {
        const allPrequelProviders = [];
        for (const provider of providerLocalDatas) {
            let prequelProvider: ProviderLocalData | undefined;
            if (provider instanceof ListProviderLocalData) {
                prequelProvider = new ListProviderLocalData(provider.prequelIds[0], provider.provider);
            } else if (provider instanceof InfoProviderLocalData) {
                prequelProvider = new InfoProviderLocalData(provider.prequelIds[0], provider.provider);
            }
            if (prequelProvider) {
                allPrequelProviders.push(prequelProvider);
            }
        }
        return allPrequelProviders;
    }

    public static async updateProvider(providerLocalData: ProviderLocalData): Promise<ProviderLocalData> {
        let currentProviderThatHasAwareness = providerLocalData;
        if (!EpisodeHelper.hasEpisodeNames(currentProviderThatHasAwareness.detailEpisodeInfo)) {
            const currentProviderThatHasAwarenessProvider = ProviderList.getExternalProviderInstance(currentProviderThatHasAwareness);
            // tslint:disable-next-line: max-line-length
            const result: ProviderLocalData | undefined = await ProviderHelper.simpleProviderLocalDataUpgradeRequest([currentProviderThatHasAwareness], currentProviderThatHasAwarenessProvider);
            if (result !== undefined) {
                currentProviderThatHasAwareness = result;
            }
        }
        return currentProviderThatHasAwareness;
    }
}
