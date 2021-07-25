import ExternalInformationProvider from '../../../api/provider/external-information-provider'
import ExternalMappingProvider from '../../../api/provider/external-mapping-provider'
import ExternalProvider from '../../../api/provider/external-provider'
import MultiProviderResult from '../../../api/provider/multi-provider-result'
import FailedProviderRequest from '../../../controller/objects/meta/failed-provider-request'
import { FailedRequestError, isFailedRequestError } from '../../../controller/objects/meta/failed-request'
import Series from '../../../controller/objects/series'
import { ProviderInfoStatus } from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status'
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data'
import ProviderList from '../../../controller/provider-controller/provider-manager/provider-list'
import ProviderNameManager from '../../../controller/provider-controller/provider-manager/provider-name-manager'
import logger from '../../../logger/logger'
import SeasonHelper from '../../season-helper/season-helper'
import ProviderExtractor from '../provider-extractor/provider-extractor'
import DownloadProviderLocalDataHelper from './download-provider-local-data-helper'
import ProviderLocalDataWithSeasonInfo from './provider-data-with-season-info'
import ProviderMappingDownloadHelper from './provider-mapping-download-helper'

export default class DownloadProviderLocalDataToTargetHelper {
    constructor(
        private series: Series,
        private provider: ExternalInformationProvider,
        private target: ProviderInfoStatus
    ) {}

    public async upgradeToTarget(): Promise<MultiProviderResult | FailedProviderRequest> {
        const result: Array<MultiProviderResult | FailedProviderRequest> = []
        let firstSeason: Series | undefined

        if (this.isCurrentProviderIdInSeriesPresent()) {
            result.push(...(await this.getLocalDataIdFromOtherProviders()))
        }
        if (!this.provider.hasUniqueIdForSeasons) {
            firstSeason = await this.getFistSeasonSeriesFromSeries()
        }
        const requestResult = await this.downloadUntilTargetLogic(firstSeason)
        if (requestResult) {
            result.push(requestResult)
        }
        if (result.filter(x => x instanceof MultiProviderResult).length === 0) {
            const resultByOtherProvider = await this.getProviderResultByOtherProvider()
            if (resultByOtherProvider) {
                result.push(resultByOtherProvider)
            }
        }
        return this.createUpgradeToTargetResult(result)
    }

    private createUpgradeToTargetResult(
        localDatas: Array<MultiProviderResult | FailedProviderRequest>
    ): MultiProviderResult | FailedProviderRequest {
        let result = ProviderExtractor.extractTargetProviderFromMultiProviderResults(this.provider, ...localDatas)
        if (result && SeasonHelper.isSeasonUndefined(result?.mainProvider.seasonTarget)) {
            if (result?.mainProvider.providerLocalData) {
                const mainProvider = new ProviderLocalDataWithSeasonInfo(result?.mainProvider.providerLocalData)
                result = new MultiProviderResult(mainProvider, ...result.subProviders)
            }
            return result
        }
        return new FailedProviderRequest(this.provider, FailedRequestError.ProviderNoResult)
    }

    private async getProviderResultByOtherProvider(): Promise<MultiProviderResult | undefined> {
        const requestResultByOtherProvider = await this.getProviderByOtherProviders()
        if (requestResultByOtherProvider) {
            this.series.addProviderDatasWithSeasonInfos(...requestResultByOtherProvider.getAllProvidersWithSeason())
            const requestResultByOtherProviderAsSource = await this.downloadProviderLocalDataUntilTarget(this.series)
            if (requestResultByOtherProviderAsSource) {
                return requestResultByOtherProviderAsSource
            }
        }
    }

    private async getProviderByOtherProviders(): Promise<MultiProviderResult | undefined> {
        const providersThatCanProvideId = ProviderExtractor.extractProvidersThatCanProviderProviderId(this.provider)
        for (const providerThatCanProvideId of providersThatCanProvideId) {
            const finalResult = await this.getProviderByOtherProvider(providerThatCanProvideId)
            if (finalResult) {
                return finalResult
            }
        }
    }

    private async getProviderByOtherProvider(provider: ExternalProvider): Promise<MultiProviderResult | undefined> {
        try {
            let finalResult
            if (provider instanceof ExternalInformationProvider) {
                finalResult = await this.getProviderByTargetProvider(provider)
            } else if (provider instanceof ExternalMappingProvider) {
                finalResult = await this.getMappingProviderByTargetProvider(provider)
            }
            return finalResult
        } catch (err) {
            logger.error(err)
        }
    }

    private async getMappingProviderByTargetProvider(
        provider: ExternalMappingProvider
    ): Promise<MultiProviderResult | undefined> {
        const mappingResult = await ProviderMappingDownloadHelper.getMappingForSeries(this.series)
        const result = ProviderExtractor.extractTargetProviderFromMultiProviderResults(this.provider, ...mappingResult)
        return result
    }

    private async getProviderByTargetProvider(
        providerForRequest: ExternalInformationProvider
    ): Promise<MultiProviderResult | undefined> {
        const downloadInstance = new DownloadProviderLocalDataToTargetHelper(
            this.series,
            providerForRequest,
            ProviderInfoStatus.FULL_INFO
        )
        const result = await downloadInstance.upgradeToTarget()
        if (result) {
            const finalResult = ProviderExtractor.extractTargetProviderFromMultiProviderResults(this.provider, result)
            if (finalResult) {
                return finalResult
            }
        }
    }

    private async downloadUntilTargetLogic(
        firstSeason: Series | undefined
    ): Promise<MultiProviderResult | null | undefined | FailedProviderRequest> {
        let requestResult
        if (firstSeason && !this.provider.hasUniqueIdForSeasons) {
            try {
                requestResult = await this.downloadProviderLocalDataUntilTarget(firstSeason)
            } catch (err) {
                logger.error(err)
            }
        }
        if (!requestResult) {
            try {
                requestResult = await this.downloadProviderLocalDataUntilTarget(this.series)
            } catch (err) {
                if (isFailedRequestError(err)) {
                    return new FailedProviderRequest(this.provider, err)
                }
                logger.error(err)
            }
        }
        return requestResult
    }

    private async downloadProviderLocalDataUntilTarget(series: Series): Promise<MultiProviderResult | null> {
        let lastLocalDataResult: ProviderLocalDataWithSeasonInfo | null = null
        let currentResult: ProviderLocalDataWithSeasonInfo | null = null
        let requestResult: MultiProviderResult | null = null
        do {
            if (currentResult) {
                series.addProviderDatasWithSeasonInfos(currentResult)
                lastLocalDataResult = currentResult
                currentResult = null
            }
            try {
                requestResult = await DownloadProviderLocalDataHelper.downloadProviderLocalData(series, this.provider)
                currentResult = requestResult.mainProvider
            } catch (err) {
                if (err !== FailedRequestError.ProviderNoResult) {
                    throw new Error(err)
                }
            }
        } while (!this.isProviderTargetReached(currentResult, lastLocalDataResult))
        return requestResult
    }

    private isProviderTargetReached(
        currentResult: ProviderLocalDataWithSeasonInfo | null,
        lastLocalDataResult: ProviderLocalDataWithSeasonInfo | null
    ): boolean {
        if (lastLocalDataResult && currentResult) {
            if (currentResult.providerLocalData.infoStatus > this.target) {
                if (currentResult.providerLocalData.infoStatus !== lastLocalDataResult.providerLocalData.infoStatus) {
                    return false
                }
            }
        } else if (!lastLocalDataResult && currentResult) {
            if (currentResult.providerLocalData.infoStatus > this.target) {
                return false
            }
        }
        return true
    }

    private isCurrentProviderIdInSeriesPresent(): boolean {
        const currentLocalData = this.series
            .getAllProviderLocalDatasWithSeasonInfo()
            .find(entry => entry.providerLocalData.provider === this.provider.providerName)
        return !currentLocalData
    }

    private async getFistSeasonSeriesFromSeries(): Promise<Series | undefined> {
        let firstSeason: Series | undefined
        try {
            firstSeason = await this.series.getFirstSeason()
        } catch (err) {
            logger.debug(err)
        }
        return firstSeason
    }

    private async getLocalDataIdFromOtherProviders(): Promise<Array<MultiProviderResult | FailedProviderRequest>> {
        const result: Array<MultiProviderResult | FailedProviderRequest> = []
        const idProviders = this.getAvaibleProvidersThatCanProvideProviderId(
            this.series.getAllProviderLocalDatas(),
            this.provider
        )
        for (const idProvider of idProviders) {
            try {
                const idProviderResult = await DownloadProviderLocalDataHelper.downloadProviderLocalData(
                    this.series,
                    idProvider
                )
                result.push(idProviderResult)
                this.series.addProviderDatasWithSeasonInfos(...idProviderResult.getAllProvidersWithSeason())
            } catch (err) {
                logger.error('Error at ProviderHelper.requestProviderInfo (See error details below):')
                logger.error(err)
                if (isFailedRequestError(err)) {
                    result.push(new FailedProviderRequest(idProvider, err))
                }
            }
        }
        return result
    }

    /**
     * Get every avaible provider that can provider the id of the target provider
     * @param avaibleProviders
     * @param targetProvider
     */
    private getAvaibleProvidersThatCanProvideProviderId(
        avaibleProviders: ProviderLocalData[],
        targetProvider: ExternalProvider
    ): ExternalInformationProvider[] {
        const result: ExternalInformationProvider[] = []
        for (const provider of avaibleProviders) {
            try {
                if (
                    provider.provider !== targetProvider.providerName &&
                    this.canGetTargetIdFromCurrentProvider(provider, targetProvider)
                ) {
                    const instance = ProviderList.getProviderInstanceByLocalData(provider)
                    result.push(instance)
                }
            } catch (err) {
                logger.debug(err)
            }
        }
        return result
    }

    private canGetTargetIdFromCurrentProvider(
        currentProvider: ProviderLocalData,
        targetProvider: ExternalProvider
    ): boolean {
        for (const supportedProvider of ProviderList.getProviderInstanceByLocalData(currentProvider)
            .potentialSubProviders) {
            try {
                if (ProviderNameManager.getProviderName(supportedProvider) === targetProvider.providerName) {
                    return true
                }
            } catch (err) {
                logger.debug(err)
            }
        }
        return false
    }
}
