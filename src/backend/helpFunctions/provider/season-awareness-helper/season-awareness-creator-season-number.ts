import ExternalInformationProvider from '../../../api/provider/external-information-provider'
import ExternalProvider from '../../../api/provider/external-provider'
import MainListAdder from '../../../controller/main-list-manager/main-list-adder'
import Season from '../../../controller/objects/meta/season'
import Series from '../../../controller/objects/series'
import { ProviderInfoStatus } from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status'
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data'
import ProviderList from '../../../controller/provider-controller/provider-manager/provider-list'
import logger from '../../../logger/logger'
import EpisodeHelper from '../../episode-helper/episode-helper'
import TitleHelper from '../../name-helper/title-helper'
import seasonHelper from '../../season-helper/season-helper'
import NewProviderHelper from '../new-provider-helper'
import ProviderHelper from '../provider-helper'
import DownloadProviderLocalDataWithoutId from '../provider-info-downloader/download-provider-local-data-without-id'
import ProviderLocalDataWithSeasonInfo from '../provider-info-downloader/provider-data-with-season-info'
import SeasonAwarenessHelper from './season-awareness-helper'
import SeasonProviderMapper from './season-provider-mapper'

export default class SeasonAwarenessCreatorSeasonNumber {
    private seriesThatShouldAdded: Series[] = []
    public async requestSeasonAwareness(
        series: Series,
        extraInfoProviders: ProviderLocalDataWithSeasonInfo[] = []
    ): Promise<ProviderLocalDataWithSeasonInfo[]> {
        const finalResult: ProviderLocalDataWithSeasonInfo[] = []
        const seasonAwarenessProviders = series.getAllProviderLocalDatasWithSeasonInfo()
        finalResult.push(...(await this.processSeasonAwareness(series, extraInfoProviders, seasonAwarenessProviders)))
        if (finalResult.length === 0) {
            const possibleSeasonAwareness = this.getAllExternalProvidersThatCanHelpToCreateSeasonAwarness()
            const moreSeasonAwareness = possibleSeasonAwareness.filter(
                a => seasonAwarenessProviders.find(p => p.providerLocalData.provider == a.providerName) == null
            )
            const newSeasonAwarnessProvider = await NewProviderHelper.getAllRequestResultsFromListOfProviders(
                series,
                moreSeasonAwareness,
                ProviderInfoStatus.ADVANCED_BASIC_INFO
            )
            series = NewProviderHelper.addRequestResultToSeries(series, newSeasonAwarnessProvider)
            const newSeasonAwarenessProviders = series.getAllProviderLocalDatasWithSeasonInfo()
            const newSeasonAwarenessProviderForProcessing = newSeasonAwarenessProviders.filter(x =>
                this.isProviderAlreadyBeenProcessed(x, seasonAwarenessProviders)
            )
            finalResult.push(
                ...(await this.processSeasonAwareness(
                    series,
                    extraInfoProviders,
                    newSeasonAwarenessProviderForProcessing
                ))
            )
        }
        await new MainListAdder().addSeriesWithoutCleanUp(...this.seriesThatShouldAdded)
        return finalResult
    }

    isProviderAlreadyBeenProcessed(
        x: ProviderLocalDataWithSeasonInfo,
        seasonAwarenessProviders: ProviderLocalDataWithSeasonInfo[]
    ): unknown {
        return seasonAwarenessProviders.find(p => p.providerLocalData.provider == x.providerLocalData.provider) == null
    }

    public async requestSeasonAwarnessForProviderLocalData(
        series: Series,
        extraInfoProviders: ProviderLocalDataWithSeasonInfo[],
        providerWithoutSeasonAwarness: ProviderLocalData
    ): Promise<ProviderLocalDataWithSeasonInfo[]> {
        let finalSeason: Season | undefined
        const targetSeason = series.getProviderSeasonTarget(providerWithoutSeasonAwarness.provider)
        if (!EpisodeHelper.hasEpisodeNames(providerWithoutSeasonAwarness.getAllDetailedEpisodes())) {
            // tslint:disable-next-line: max-line-length
            const result: ProviderLocalData | undefined = await ProviderHelper.simpleProviderLocalDataUpgradeRequest(
                [providerWithoutSeasonAwarness],
                ProviderList.getProviderInstanceByLocalData(providerWithoutSeasonAwarness)
            )
            if (result !== undefined) {
                providerWithoutSeasonAwarness = result
            }
        }

        if (!seasonHelper.isSeasonUndefined(targetSeason)) {
            finalSeason = targetSeason as Season
        }
        const allProviders = [...series.getAllProviderLocalDatas(), ...extraInfoProviders.map(x => x.providerLocalData)]
        const externalProviders = this.getAllExternalProvidersThatCanHelpToCreateSeasonAwarness()
        return this.processExternalProviderForSeasonAwarness(
            externalProviders,
            allProviders,
            series,
            providerWithoutSeasonAwarness,
            finalSeason
        )
    }

    private async processSeasonAwareness(
        series: Series,
        extraInfoProviders: ProviderLocalDataWithSeasonInfo[],
        seasonAwarenessProvider: ProviderLocalDataWithSeasonInfo[]
    ) {
        const finalResult: ProviderLocalDataWithSeasonInfo[] = []

        for (const listProvider of seasonAwarenessProvider) {
            try {
                if (
                    ProviderList.getProviderInstanceByLocalData(listProvider.providerLocalData)
                        .hasEpisodeTitleOnFullInfo
                ) {
                    if (SeasonAwarenessHelper.canCreateSeasonAwareness(listProvider)) {
                        const result = await this.requestSeasonAwarnessForProviderLocalData(
                            series,
                            extraInfoProviders,
                            listProvider.providerLocalData
                        )
                        if (result) {
                            finalResult.push(...result)
                        }
                    }
                }
            } catch (err) {
                logger.error(err as string)
            }
        }
        return finalResult
    }

    private async processExternalProviderForSeasonAwarness(
        externalProviders: ExternalInformationProvider[],
        allProviders: ProviderLocalData[],
        series: Series,
        providerWithoutSeasonAwarness: ProviderLocalData,
        finalSeason: Season | undefined
    ): Promise<ProviderLocalDataWithSeasonInfo[]> {
        for (const externalProvider of externalProviders) {
            try {
                if (
                    providerWithoutSeasonAwarness.provider !== externalProvider.providerName &&
                    (finalSeason !== undefined ||
                        ProviderList.getProviderInstanceByLocalData(providerWithoutSeasonAwarness)
                            .hasUniqueIdForSeasons !== externalProvider.hasUniqueIdForSeasons)
                ) {
                    const providerLocalData = await this.getValidProviderLocalData(
                        allProviders,
                        series,
                        externalProvider,
                        finalSeason !== undefined
                    )
                    if (providerLocalData) {
                        const result = await this.getSeasonForProviderThatDontHaveSeason(
                            providerLocalData,
                            providerWithoutSeasonAwarness,
                            finalSeason
                        )
                        if (result) {
                            return result
                        }
                    }
                }
            } catch (err) {
                logger.error(err as string)
            }
        }
        return []
    }

    private async getValidProviderLocalData(
        allProviders: ProviderLocalData[],
        series: Series,
        externalProvider: ExternalInformationProvider,
        firstSeasonAllowed: boolean
    ): Promise<ProviderLocalData | undefined> {
        let providerLocalData = allProviders.find(x => x.provider === externalProvider.providerName)
        if (!providerLocalData && firstSeasonAllowed) {
            providerLocalData = await this.getProviderLocalDataFromFirstSeason(series, externalProvider)
        }
        if (!providerLocalData) {
            providerLocalData = await ProviderHelper.simpleProviderLocalDataUpgradeRequest(
                allProviders,
                externalProvider
            )
        }
        if (!providerLocalData) {
            try {
                let names = series.getAllNames()
                names = TitleHelper.getAllNamesSortedBySearchAbleScore(names)
                const result = await new DownloadProviderLocalDataWithoutId(
                    series,
                    externalProvider
                ).downloadProviderSeriesInfoBySeriesName(names)
                providerLocalData = result?.mainProvider.providerLocalData
            } catch (err) {
                logger.error(err as string)
            }
        }
        return providerLocalData
    }

    private async getProviderLocalDataFromFirstSeason(
        series: Series,
        providerInstance: ExternalProvider
    ): Promise<ProviderLocalData | undefined> {
        logger.debug(
            '[SeasonAwarenessCreatorSeasonNumber] [getProviderLocalDataFromFirstSeason] for provider instance: ' +
                providerInstance.providerName
        )
        try {
            return (await series.getFirstSeason()).getOneProviderLocalDataByExternalProvider(providerInstance)
        } catch (err) {
            logger.debug(err as string)
            return undefined
        }
    }

    private async getSeasonForProviderThatDontHaveSeason(
        providerThatHasAwarenss: ProviderLocalData,
        providerThatDontHaveAwareness: ProviderLocalData,
        targetSeason: Season | undefined
    ): Promise<ProviderLocalDataWithSeasonInfo[]> {
        const createSeasonInstance = new SeasonProviderMapper(providerThatHasAwarenss, providerThatDontHaveAwareness)
        return createSeasonInstance.getProviderLocalDataWithSeasonTarget(targetSeason)
    }

    private getAllExternalProvidersThatCanHelpToCreateSeasonAwarness(): ExternalInformationProvider[] {
        const result = []
        for (const externalProvider of ProviderList.getAllExternalInformationProvider()) {
            if (externalProvider.hasEpisodeTitleOnFullInfo) {
                result.push(externalProvider)
            }
        }
        return result
    }
}
