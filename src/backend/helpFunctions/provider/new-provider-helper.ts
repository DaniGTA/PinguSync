import ExternalInformationProvider from '../../api/provider/external-information-provider';
import InfoProvider from '../../api/provider/info-provider';
import ListProvider from '../../api/provider/list-provider';
import MultiProviderResult from '../../api/provider/multi-provider-result';
import Series from '../../controller/objects/series';
import { ProviderInfoStatus } from '../../controller/provider-manager/local-data/interfaces/provider-info-status';
import ProviderLocalData from '../../controller/provider-manager/local-data/interfaces/provider-local-data';
import ProviderList from '../../controller/provider-manager/provider-list';
import logger from '../../logger/logger';
import ProviderHelper from './provider-helper';
import ProviderLocalDataWithSeasonInfo from './provider-info-downloader/provider-data-with-season-info';
import ProviderMappingDownloadHelper from './provider-info-downloader/provider-mapping-download-helper';
import SeasonAwarenessCreatorSeasonNumber from './season-awareness-helper/season-awareness-creator-season-number';

export default class NewProviderHelper {

    public static async getAllRelevantProviderInfosForSeries(series: Series): Promise<Series> {
        const upgradedinfos = await ProviderHelper.requestUpgradeAllCurrentinfos(series, false);
        await series.addProviderDatasWithSeasonInfos(...upgradedinfos);

        let proivderLocalDataFromMappings = await this.requestAllMappingProvider(series);
        await series.addProviderDatasWithSeasonInfos(...proivderLocalDataFromMappings);

        const offlineProviders = this.getAllOfflineInfoProviders();
        const offlineProviderResults = await this.getAllRequestResultsFromListOfProviders(series, offlineProviders, ProviderInfoStatus.BASIC_INFO);
        for (const offlineProviderResult of offlineProviderResults) {
            await series.addProviderDatasWithSeasonInfos(...offlineProviderResult.getAllProvidersWithSeason());
        }

        if (proivderLocalDataFromMappings.length === 0) {
            proivderLocalDataFromMappings = await this.requestAllMappingProvider(series);
            await series.addProviderDatasWithSeasonInfos(...proivderLocalDataFromMappings);
        }

        const missingProviders = await this.missingRelevantProviders(series, ProviderInfoStatus.ADVANCED_BASIC_INFO);
        const missingProviderResults = await this.getAllRequestResultsFromListOfProviders(series, missingProviders, ProviderInfoStatus.ADVANCED_BASIC_INFO);
        for (const missingProviderResult of missingProviderResults) {
            await series.addProviderDatasWithSeasonInfos(...missingProviderResult.getAllProvidersWithSeason());
        }

        if (proivderLocalDataFromMappings.length === 0) {
            proivderLocalDataFromMappings = await this.requestAllMappingProvider(series);
            await series.addProviderDatasWithSeasonInfos(...proivderLocalDataFromMappings);
        }

        let clearedBindings = false;

        const pl = await new SeasonAwarenessCreatorSeasonNumber().requestSeasonAwareness(series, []);
        if (pl.length !== 0) {
            if (this.anyIdChangeForUniqueIds(series, pl)) {
                series.clearAllBindings();
                clearedBindings = true;
            }
            await series.addProviderDatasWithSeasonInfos(...pl);
        }

        proivderLocalDataFromMappings = await this.requestAllMappingProvider(series);
        await series.addProviderDatasWithSeasonInfos(...proivderLocalDataFromMappings);

        if (clearedBindings) {
            const missingProviders2 = await this.missingRelevantProviders(series, ProviderInfoStatus.ADVANCED_BASIC_INFO);
            const missingProviderResults2 = await this.getAllRequestResultsFromListOfProviders(series, missingProviders2, ProviderInfoStatus.ADVANCED_BASIC_INFO);
            for (const missingProviderResult of missingProviderResults2) {
                await series.addProviderDatasWithSeasonInfos(...missingProviderResult.getAllProvidersWithSeason());
            }
        }

        return series;
    }

    public static async requestAllMappingProvider(series: Series): Promise<ProviderLocalDataWithSeasonInfo[]> {
        const result: ProviderLocalDataWithSeasonInfo[] = [];
        const allMappingResults = await ProviderMappingDownloadHelper.getMappingForSeries(series);
        for (const mappingResult of allMappingResults) {
            for (const providerLocalData of mappingResult.getAllProvidersWithSeason()) {
                if (!this.isProviderLocalDataProviderAndIdInList(result, providerLocalData)) {
                    result.push(providerLocalData);
                }
            }
        }
        return result;
    }

    private static isProviderLocalDataProviderAndIdInList(providerLocalDataWithSeasonList: ProviderLocalDataWithSeasonInfo[], providerLocalDataWithSeason: ProviderLocalDataWithSeasonInfo) {
        for (const providerLocalDataWithSeasonEntry of providerLocalDataWithSeasonList) {
            if (providerLocalDataWithSeasonEntry.providerLocalData.provider === providerLocalDataWithSeason.providerLocalData.provider) {
                if (providerLocalDataWithSeasonEntry.providerLocalData.id == providerLocalDataWithSeason.providerLocalData.id) {
                    return true;
                }
            }
        }
        return false;
    }

    private static anyIdChangeForUniqueIds(series: Series, providerLocalDatas: ProviderLocalDataWithSeasonInfo[]): boolean {
        const oldProviderLocalDatas = series.getAllProviderLocalDatas();
        for (const providerLocalData of providerLocalDatas) {
            const providerInstance = ProviderList.getExternalProviderInstance(providerLocalData);
            if (providerInstance.hasUniqueIdForSeasons) {
                const oldLocalData = oldProviderLocalDatas.find((x) => x.provider === providerInstance.providerName);
                if (oldLocalData) {
                    // tslint:disable-next-line: triple-equals
                    return !(oldLocalData.id == providerLocalData.providerLocalData.id);
                }
            }
        }
        return false;
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
        const providerThatSupportOfflineNameSearch: InfoProvider[] = [];
        const allInfoProviders = ProviderList.getInfoProviderList();
        for (const provider of allInfoProviders) {
            if (!provider.requireInternetAccessGetMoreSeriesInfoByName) {
                providerThatSupportOfflineNameSearch.push(provider);
            }
        }
        return providerThatSupportOfflineNameSearch;
    }

    private static async missingRelevantProviders(series: Series, target: ProviderInfoStatus): Promise<ExternalInformationProvider[]> {
        const missingRelevantProviders = [];
        const allReleveantProviders = await this.getAllRelevantProviders();
        const localDatas = series.getAllProviderLocalDatas();
        for (const relevantProvider of allReleveantProviders) {
            if (!this.providerLocalDataContainsExternalProvider(localDatas, relevantProvider) ||
                !this.isProviderLocalDataUpToDate(localDatas, relevantProvider, target)) {
                missingRelevantProviders.push(relevantProvider);
            }
        }
        return missingRelevantProviders;
    }

    private static providerLocalDataContainsExternalProvider(localDatas: ProviderLocalData[], provider: ExternalInformationProvider): boolean {
        const result = this.getProviderLocalDataByProvider(localDatas, provider);
        return result !== undefined;
    }

    private static isProviderLocalDataUpToDate(localDatas: ProviderLocalData[], provider: ExternalInformationProvider, target: ProviderInfoStatus) {
        const providerLocalData = this.getProviderLocalDataByProvider(localDatas, provider);
        if (providerLocalData) {

            if (providerLocalData.infoStatus > target) {
                return false;
            }
            if (providerLocalData.version === provider.version) {
                return true;
            }
        }
        return false;
    }

    private static getProviderLocalDataByProvider(localDatas: ProviderLocalData[], provider: ExternalInformationProvider): ProviderLocalData | undefined {
        for (const localData of localDatas) {
            if (localData.provider === provider.providerName) {
                return localData;
            }
        }
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
