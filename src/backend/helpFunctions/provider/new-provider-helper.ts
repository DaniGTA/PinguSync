import ExternalInformationProvider from '../../api/provider/external-information-provider'
import InfoProvider from '../../api/provider/info-provider'
import ListProvider from '../../api/provider/list-provider'
import MultiProviderResult from '../../api/provider/multi-provider-result'
import FailedProviderRequest from '../../controller/objects/meta/failed-provider-request'
import Series from '../../controller/objects/series'
import { ProviderInfoStatus } from '../../controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status'
import ProviderLocalData from '../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data'
import ProviderList from '../../controller/provider-controller/provider-manager/provider-list'
import logger from '../../logger/logger'
import ProviderComperator from '../comperators/provider-comperator'
import ProviderHelper from './provider-helper'
import DownloadProviderLocalDataToTargetHelper from './provider-info-downloader/download-provider-local-data-to-target-helper'
import ProviderLocalDataWithSeasonInfo from './provider-info-downloader/provider-data-with-season-info'
import ProviderMappingDownloadHelper from './provider-info-downloader/provider-mapping-download-helper'
import SeasonAwarenessCreatorSeasonNumber from './season-awareness-helper/season-awareness-creator-season-number'

export default class NewProviderHelper {
    public static canUpdateAnyProvider(series: Series): boolean {
        logger.debug('Check if it can update any provider for series: ' + series.id)
        const allProviderLocalDatats = series.getAllProviderLocalDatas()
        for (const providerLocalData of allProviderLocalDatats) {
            try {
                const providerInstance = ProviderList.getProviderInstanceByLocalData(providerLocalData)
                if (
                    providerInstance.version !== providerLocalData.version &&
                    series.getAllErrosForOneProvider(providerInstance).length === 0
                ) {
                    return true
                }
            } catch (err) {
                logger.debug(err as string)
            }
        }
        return false
    }

    public static async canUpdateRelevantProvider(series: Series): Promise<boolean> {
        const allRelevantProviders = await this.getAllRelevantProviders()
        for (const relevantProvider of allRelevantProviders) {
            for (const binding of series.getEpisodeBindingPools()) {
                if (!binding.isBindingPoolHaveThisProvider(relevantProvider.providerName)) {
                    return true
                }
            }
        }
        return false
    }

    public static async missingAnyReleventProvider(series: Series): Promise<boolean> {
        const missingProviders2 = await NewProviderHelper.missingRelevantProviders(
            series,
            ProviderInfoStatus.ADVANCED_BASIC_INFO
        )
        return missingProviders2.length !== 0
    }

    public static async getAllRelevantProviderInfosForSeries(series: Series): Promise<Series> {
        const upgradedinfos = await ProviderHelper.requestUpgradeAllCurrentinfos(series)
        series.addProviderDatasWithSeasonInfos(...upgradedinfos)

        let proivderLocalDataFromMappings = await this.requestAllMappingProvider(series)
        series.addProviderDatasWithSeasonInfos(...proivderLocalDataFromMappings)

        const offlineProviders = this.getAllOfflineInfoProviders()
        const offlineProviderResults = await this.getAllRequestResultsFromListOfProviders(
            series,
            offlineProviders,
            ProviderInfoStatus.BASIC_INFO
        )
        series = this.addRequestResultToSeries(series, offlineProviderResults)

        const missingProviders = await this.missingRelevantProviders(series, ProviderInfoStatus.ADVANCED_BASIC_INFO)
        const missingProviderResults = await this.getAllRequestResultsFromListOfProviders(
            series,
            missingProviders,
            ProviderInfoStatus.ADVANCED_BASIC_INFO
        )
        series = this.addRequestResultToSeries(series, missingProviderResults)

        let clearedBindings = false

        const pl = await new SeasonAwarenessCreatorSeasonNumber().requestSeasonAwareness(series, [])
        if (pl.length !== 0) {
            if (this.anyIdChangeForUniqueIds(series, pl)) {
                series.clearAllBindings()
                clearedBindings = true
            }
            series.addProviderDatasWithSeasonInfos(...pl)
        }

        proivderLocalDataFromMappings = await this.requestAllMappingProvider(series)
        series.addProviderDatasWithSeasonInfos(...proivderLocalDataFromMappings)

        if (clearedBindings) {
            const missingProviders2 = await this.missingRelevantProviders(
                series,
                ProviderInfoStatus.ADVANCED_BASIC_INFO
            )
            const missingProviderResults2 = await this.getAllRequestResultsFromListOfProviders(
                series,
                missingProviders2,
                ProviderInfoStatus.ADVANCED_BASIC_INFO
            )
            series = this.addRequestResultToSeries(series, missingProviderResults2)
        }

        const providersForEpisodeMapping = await this.getAllProvidersThatAreNeededForEpisodeMapping(series)
        const providersForEpisodeMappingResult = await this.getAllRequestResultsFromListOfProviders(
            series,
            providersForEpisodeMapping,
            ProviderInfoStatus.FULL_INFO
        )
        series = this.addRequestResultToSeries(series, providersForEpisodeMappingResult)

        return series
    }

    /**
     * Some times Provider that should provider episode titles dont gives episode titles.
     */
    private static async getAllProvidersThatAreNeededForEpisodeMapping(
        series: Series
    ): Promise<ExternalInformationProvider[]> {
        const allRelevantProviders = await this.getAllRelevantProviders()
        if (!(await this.didAllProvidersContainUniqueSeasonIds(allRelevantProviders))) {
            const uniqueIdProviders = allRelevantProviders.filter(x => x.hasUniqueIdForSeasons)
            const didUniqueIdHasEpisodeTitles = this.hasLocalDataOfGivenProvidersEpisodeTitles(
                uniqueIdProviders,
                series
            )
            const commonProviders = allRelevantProviders.filter(x => !x.hasUniqueIdForSeasons)
            const didCommonIdHasEpisodeTitles = this.hasLocalDataOfGivenProvidersEpisodeTitles(commonProviders, series)

            if (didCommonIdHasEpisodeTitles && commonProviders.length !== 0) {
                if (didUniqueIdHasEpisodeTitles && uniqueIdProviders.length !== 0) {
                    return []
                } else {
                    return ProviderList.getAllExternalInformationProvider().filter(
                        x => x.hasUniqueIdForSeasons && x.hasEpisodeTitleOnFullInfo
                    )
                }
            } else if (didUniqueIdHasEpisodeTitles && uniqueIdProviders.length !== 0) {
                return ProviderList.getAllExternalInformationProvider().filter(
                    x => !x.hasUniqueIdForSeasons && x.hasEpisodeTitleOnFullInfo
                )
            }
        }
        return []
    }

    private static hasLocalDataOfGivenProvidersEpisodeTitles(
        providers: ExternalInformationProvider[],
        series: Series
    ): boolean {
        for (const provider of providers) {
            if (provider.hasEpisodeTitleOnFullInfo) {
                const localData = series.getOneProviderLocalDataByExternalProvider(provider)
                if (localData !== undefined && localData.hasDetailedEpisodeTitles()) {
                    return true
                }
            }
        }
        return false
    }

    private static async didAllProvidersContainUniqueSeasonIds(providers: ExternalInformationProvider[]) {
        for (const provider of providers) {
            if (!provider.hasUniqueIdForSeasons) {
                return false
            }
        }
        return true
    }

    public static async requestAllMappingProvider(series: Series): Promise<ProviderLocalDataWithSeasonInfo[]> {
        const result: ProviderLocalDataWithSeasonInfo[] = []
        const allMappingResults = await ProviderMappingDownloadHelper.getMappingForSeries(series)
        for (const mappingResult of allMappingResults) {
            for (const providerLocalData of mappingResult.getAllProvidersWithSeason()) {
                if (!this.isProviderLocalDataProviderAndIdInList(result, providerLocalData)) {
                    result.push(providerLocalData)
                }
            }
        }
        return result
    }

    public static addRequestResultToSeries(
        series: Series,
        results: Array<MultiProviderResult | FailedProviderRequest>
    ): Series {
        for (const result of results) {
            if (result instanceof FailedProviderRequest) {
                series.addFailedRequest(result)
            } else if (result instanceof MultiProviderResult) {
                series.addProviderDatasWithSeasonInfos(...result.getAllProvidersWithSeason())
            }
        }
        return series
    }

    public static async getAllRequestResultsFromListOfProviders(
        series: Series,
        providers: ExternalInformationProvider[],
        target: ProviderInfoStatus
    ): Promise<Array<MultiProviderResult | FailedProviderRequest>> {
        const results: Array<MultiProviderResult | FailedProviderRequest> = []
        for (const provider of providers) {
            try {
                const result = await new DownloadProviderLocalDataToTargetHelper(
                    series,
                    provider,
                    target
                ).upgradeToTarget()
                if (result) {
                    results.push(result)
                }
            } catch (err) {
                if (err instanceof FailedProviderRequest) {
                    results.push(err)
                }
                logger.debug(err as string)
            }
        }
        return results
    }

    private static isProviderLocalDataProviderAndIdInList(
        providerLocalDataWithSeasonList: ProviderLocalDataWithSeasonInfo[],
        providerLocalDataWithSeason: ProviderLocalDataWithSeasonInfo
    ): boolean {
        for (const providerLocalDataWithSeasonEntry of providerLocalDataWithSeasonList) {
            if (
                providerLocalDataWithSeasonEntry.providerLocalData.provider ===
                providerLocalDataWithSeason.providerLocalData.provider
            ) {
                if (
                    ProviderComperator.simpleProviderIdCheck(
                        providerLocalDataWithSeasonEntry.providerLocalData.id,
                        providerLocalDataWithSeason.providerLocalData.id
                    )
                ) {
                    return true
                }
            }
        }
        return false
    }

    private static anyIdChangeForUniqueIds(
        series: Series,
        providerLocalDatas: ProviderLocalDataWithSeasonInfo[]
    ): boolean {
        const oldProviderLocalDatas = series.getAllProviderLocalDatas()
        for (const providerLocalData of providerLocalDatas) {
            const providerInstance = ProviderList.getProviderInstanceByLocalData(providerLocalData)
            if (providerInstance.hasUniqueIdForSeasons) {
                const oldLocalData = oldProviderLocalDatas.find(x => x.provider === providerInstance.providerName)
                if (oldLocalData) {
                    // tslint:disable-next-line: triple-equals
                    return oldLocalData.id != providerLocalData.providerLocalData.id
                } else {
                    return true
                }
            }
        }
        return false
    }

    private static getAllOfflineInfoProviders(): InfoProvider[] {
        const providerThatSupportOfflineNameSearch: InfoProvider[] = []
        const allInfoProviders = ProviderList.getInfoProviderList()
        for (const provider of allInfoProviders) {
            if (!provider.requireInternetAccessGetMoreSeriesInfoByName) {
                providerThatSupportOfflineNameSearch.push(provider)
            }
        }
        return providerThatSupportOfflineNameSearch
    }

    private static async missingRelevantProviders(
        series: Series,
        target: ProviderInfoStatus
    ): Promise<ExternalInformationProvider[]> {
        const missingRelevantProviders = []
        const allReleveantProviders = await this.getAllRelevantProviders()
        const localDatas = series.getAllProviderLocalDatas()
        for (const relevantProvider of allReleveantProviders) {
            if (
                !this.providerLocalDataContainsExternalProvider(localDatas, relevantProvider) ||
                !this.isProviderLocalDataUpToDate(localDatas, relevantProvider, target)
            ) {
                missingRelevantProviders.push(relevantProvider)
            }
        }
        return missingRelevantProviders
    }

    private static providerLocalDataContainsExternalProvider(
        localDatas: ProviderLocalData[],
        provider: ExternalInformationProvider
    ): boolean {
        const result = this.getProviderLocalDataByProvider(localDatas, provider)
        return result !== undefined
    }

    private static isProviderLocalDataUpToDate(
        localDatas: ProviderLocalData[],
        provider: ExternalInformationProvider,
        target: ProviderInfoStatus
    ): boolean {
        const providerLocalData = this.getProviderLocalDataByProvider(localDatas, provider)
        if (providerLocalData) {
            if (providerLocalData.infoStatus > target) {
                return false
            }
            if (providerLocalData.version === provider.version) {
                return true
            }
        }
        return false
    }

    private static getProviderLocalDataByProvider(
        localDatas: ProviderLocalData[],
        provider: ExternalInformationProvider
    ): ProviderLocalData | undefined {
        for (const localData of localDatas) {
            if (localData.provider === provider.providerName) {
                return localData
            }
        }
    }

    private static async getAllRelevantProviders(): Promise<ExternalInformationProvider[]> {
        const allRelevantProviders: ExternalInformationProvider[] = []
        const allProviders = ProviderList.getListProviderList()
        for (const provider of allProviders) {
            if (await this.providerHasUserLoggedIn(provider)) {
                allRelevantProviders.push(provider)
            }
        }
        return allRelevantProviders
    }

    private static async providerHasUserLoggedIn(provider: ListProvider): Promise<boolean> {
        try {
            return await provider.isUserLoggedIn()
        } catch (err) {
            logger.debug(err as string)
        }
        return false
    }
}
