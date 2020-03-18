import ExternalProvider from '../../api/provider/external-provider';
import InfoProvider from '../../api/provider/info-provider';
import ListProvider from '../../api/provider/list-provider';
import MultiProviderResult from '../../api/provider/multi-provider-result';
import Series from '../../controller/objects/series';
import { ProviderInfoStatus } from '../../controller/provider-manager/local-data/interfaces/provider-info-status';
import ProviderLocalData from '../../controller/provider-manager/local-data/interfaces/provider-local-data';
import ProviderList from '../../controller/provider-manager/provider-list';
import logger from '../../logger/logger';
import ProviderHelper from './provider-helper';
import SeasonAwarenessCreatorSeasonNumber from './season-awareness-helper/season-awareness-creator-season-number';
import ExternalInformationProvider from '../../api/provider/external-information-provider';

export default class NewProviderHelper {

    public static async getAllRelevantProviderInfosForSeries(series: Series): Promise<Series> {
        const upgradedinfos = await ProviderHelper.requestUpgradeAllCurrentinfos(series, false);
        await series.addProviderDatasWithSeasonInfos(...upgradedinfos);

        const offlineProviders = this.getAllOfflineInfoProviders();
        const offlineProviderResults = await this.getAllRequestResultsFromListOfProviders(series, offlineProviders, ProviderInfoStatus.BASIC_INFO);
        for (const offlineProviderResult of offlineProviderResults) {
            await series.addProviderDatasWithSeasonInfos(...offlineProviderResult.getAllProvidersWithSeason());
        }

        const missingProviders = await this.missingRelevantProviders(series);
        const missingProviderResults = await this.getAllRequestResultsFromListOfProviders(series, missingProviders, ProviderInfoStatus.ADVANCED_BASIC_INFO);
        for (const missingProviderResult of missingProviderResults) {
            await series.addProviderDatasWithSeasonInfos(...missingProviderResult.getAllProvidersWithSeason());
        }

        const pl = await new SeasonAwarenessCreatorSeasonNumber().requestSeasonAwareness(series, []);
        await series.addProviderDatasWithSeasonInfos(...pl);

        return series;
    }

    private static async getAllRequestResultsFromListOfProviders(series: Series, providers: ExternalInformationProvider[], target: ProviderInfoStatus): Promise<MultiProviderResult[]> {
        const results = [];
        for (const provider of providers) {
            try {
                const result = await ProviderHelper.requestProviderInfoUpgrade(series, provider, false, target);
                if (result) {
                    results.push(result);
                }
            } catch (err) {
                logger.debug(err);
            }
        }
        return results;
    }

    private static getAllOfflineInfoProviders(): InfoProvider[] {
        const providerThatSupportOfflineNameSearch = [];
        const allInfoProviders = ProviderList.getInfoProviderList();
        for (const provider of allInfoProviders) {
            if (!provider.requireGetMoreSeriesInfoByNameInternetAccess) {
                providerThatSupportOfflineNameSearch.push(provider);
            }
        }
        return providerThatSupportOfflineNameSearch;
    }

    private static async missingRelevantProviders(series: Series): Promise<ExternalInformationProvider[]> {
        const missingRelevantProviders = [];
        const allReleveantProviders = await this.getAllRelevantProviders();
        const localDatas = series.getAllProviderLocalDatas();
        for (const relevantProvider of allReleveantProviders) {
            if (!this.providerLocalDataContainsExternalProvider(localDatas, relevantProvider)) {
                missingRelevantProviders.push(relevantProvider);
            }
        }
        return missingRelevantProviders;
    }

    private static providerLocalDataContainsExternalProvider(localDatas: ProviderLocalData[], provider: ExternalInformationProvider): boolean {
        for (const localData of localDatas) {
            if (localData.provider === provider.providerName) {
                return true;
            }
        }
        return false;
    }

    private static async getAllRelevantProviders(): Promise<ExternalInformationProvider[]> {
        const allRelevantProviders: ExternalInformationProvider[] = [];
        const allProviders = ProviderList.getListProviderList();
        for (const provider of allProviders) {
            if (await this.providerHasUserLoggedIn(provider)) {
                allRelevantProviders.push(provider);
            }
        }
        return allRelevantProviders;
    }

    private static async providerHasUserLoggedIn(provider: ListProvider) {
        try {
            return await provider.isUserLoggedIn();
        } catch (err) {
            logger.debug(err);
        }
        return false;
    }

}
