import Series from '../../../controller/objects/series';
import RelationSearchResults from '../../../controller/objects/transfer/relation-search-results';
import ProviderDataListAdder from '../../../controller/provider-controller/provider-data-list-manager/provider-data-list-adder';
import { InfoProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import { ListProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../controller/provider-controller/provider-manager/provider-list';
import logger from '../../../logger/logger';
import EpisodeHelper from '../../episode-helper/episode-helper';
import ProviderHelper from '../provider-helper';
import ProviderLocalDataWithSeasonInfo from '../provider-info-downloader/provider-data-with-season-info';

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

    public static canCreateSeasonAwareness(provider: ProviderLocalDataWithSeasonInfo): boolean {
        if (!ProviderList.getProviderInstanceByLocalData(provider.providerLocalData).hasUniqueIdForSeasons) {
            if (provider.seasonTarget?.seasonNumbers.length === 0 || provider.seasonTarget?.seasonPart === undefined) {
                return true;
            }
        }

        return false;
    }

    public static isProviderSeasonAware(provider: ProviderLocalDataWithSeasonInfo): boolean {
        if (!ProviderList.getProviderInstanceByLocalData(provider.providerLocalData).hasUniqueIdForSeasons) {
            if (provider.seasonTarget?.getSingleSeasonNumberAsNumber() === undefined) {
                return false;
            }
            return provider.seasonTarget.confirmed;
        }
        return true;
    }

    public static getOtherProvidersWithSeasonAwareness(series: Series, filterOut: ProviderLocalData): ProviderLocalData[] {
        const collectedProviders: ProviderLocalData[] = [];
        const allProviders = series.getAllProviderLocalDatas();
        for (const providerLocalData of allProviders) {
            if (providerLocalData.provider !== filterOut.provider) {
                try {
                    if (ProviderList.getProviderInstanceByLocalData(providerLocalData).hasEpisodeTitleOnFullInfo) {
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
            const currentProviderThatHasAwarenessProvider = ProviderList.getProviderInstanceByLocalData(currentProviderThatHasAwareness);
            // tslint:disable-next-line: max-line-length
            const result: ProviderLocalData | undefined = await ProviderHelper.simpleProviderLocalDataUpgradeRequest([currentProviderThatHasAwareness], currentProviderThatHasAwarenessProvider);
            if (result !== undefined) {
                await new ProviderDataListAdder().addNewProviderData(result);
                currentProviderThatHasAwareness = result;
            }
        }
        return currentProviderThatHasAwareness;
    }
}
