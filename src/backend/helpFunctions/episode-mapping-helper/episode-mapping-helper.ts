import MainListSearcher from '../../controller/main-list-manager/main-list-searcher'
import EpisodeBindingPool from '../../controller/objects/meta/episode/episode-binding-pool'
import Season from '../../controller/objects/meta/season'
import Series from '../../controller/objects/series'
import ProviderLocalData from '../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data'
import logger from '../../logger/logger'
import EpisodeBindingPoolHelper from '../episode-binding-pool-helper'
import ProviderLocalDataWithSeasonInfo from '../provider/provider-info-downloader/provider-data-with-season-info'
import EpisodeGeneratorHelper from './episode-generator-helper'
import EpisodeRatedEqualityContainerHelper from './episode-rated-equality-container-helper'
import EpisodeRatedEqualityHelper from './episode-rated-equality-helper'
import EpisodeRatedEqualityContainer from './objects/episode-rated-equality-container'
import ProviderAndSeriesPackage from './objects/provider-series-package'

export default class EpisodeMappingHelper {
    /**
     * static getEpisodeMappings
     */
    public static async getEpisodeMappings(series: Series): Promise<EpisodeBindingPool[]> {
        const asyncSeason = series.getSeason()
        const allProviders = series.getAllProviderLocalDatasWithSeasonInfo()
        const allEpisodeBindingPools = this.getAllEpisodeBindingsThatAreRelevant(allProviders)
        for (const provider of allProviders) {
            if (!this.detailedEpisodeIsPresent(provider.providerLocalData)) {
                const generateEpisodes = EpisodeGeneratorHelper.generateMissingEpisodes(
                    provider.providerLocalData,
                    provider.seasonTarget
                )
                provider.providerLocalData.addDetailedEpisodeInfos(...generateEpisodes)
            }
        }
        const allProvidersWithEpisodes = this.getAllProviderThatContainsEpisodes(allProviders)
        this.sortProviderWithEpisodeTitleAtFirst(allProvidersWithEpisodes)
        for (let index = 0; index < allProviders.length; index++) {
            const providerA = allProviders[index]
            const compareToProviders = this.getAllProviderThatCanBeMappedToEpisodeOfProvider(providerA, allProviders)
            this.sortProviderWithEpisodeTitleAtFirst(compareToProviders)
            for (const providerB of compareToProviders) {
                series.addEpisodeBindingPools(
                    ...(await this.getEpisodeMapping(series, providerA, providerB, asyncSeason, allEpisodeBindingPools))
                )
            }
        }
        return series.episodeBindingPools
    }

    private static async getEpisodeMapping(
        series: Series,
        providerA: ProviderLocalDataWithSeasonInfo,
        providerB: ProviderLocalDataWithSeasonInfo,
        season: Promise<Season>,
        allEpisodeBindingPools: EpisodeBindingPool[]
    ): Promise<EpisodeBindingPool[]> {
        const episodeMappingResult: EpisodeBindingPool[] = []
        try {
            const ratingInstance = new EpisodeRatedEqualityHelper(series.episodeBindingPools, allEpisodeBindingPools)
            const packageA = new ProviderAndSeriesPackage(providerA, series)
            const packageB = new ProviderAndSeriesPackage(providerB, series)
            const ratings = ratingInstance.getRatedEqualityFromTwoProviders(packageA, packageB, await season)
            const bestRatings = EpisodeRatedEqualityContainerHelper.getBestResultsFromEpisodeRatedEqualityContainer(
                ratings
            )
            for (const bestRating of bestRatings) {
                if (!this.isAnyOfEpisodeRatedEqualityContainerAlreadyBinded(series.episodeBindingPools, bestRating)) {
                    episodeMappingResult.push(new EpisodeBindingPool(...bestRating.getEpisodeMappings()))
                }
            }
        } catch (err) {
            logger.debug(err)
        }
        return episodeMappingResult
    }

    private static sortProviderWithEpisodeTitleAtFirst(allProviders: ProviderLocalDataWithSeasonInfo[]): void {
        allProviders.sort(provider => Number(this.detailedEpisodeHasTitle(provider.providerLocalData) ? -1 : 1))
    }

    private static getAllProviderThatCanBeMappedToEpisodeOfProvider(
        targetProvider: ProviderLocalDataWithSeasonInfo,
        allProviders: ProviderLocalDataWithSeasonInfo[]
    ): ProviderLocalDataWithSeasonInfo[] {
        if (this.containsProviderEpisodes(targetProvider.providerLocalData)) {
            const allProvidersWithEpisodes = this.getAllProviderThatContainsEpisodes(allProviders)
            const providerHasEpisodeTitles = this.detailedEpisodeHasTitle(targetProvider.providerLocalData)

            const preResult = []
            for (const provider of allProvidersWithEpisodes) {
                if (targetProvider.providerLocalData.provider !== provider.providerLocalData.provider) {
                    if (
                        (providerHasEpisodeTitles && this.detailedEpisodeHasTitle(provider.providerLocalData)) ||
                        targetProvider.providerLocalData.getAllRegularEpisodes().length ===
                            provider.providerLocalData.getAllRegularEpisodes().length
                    ) {
                        preResult.push(provider)
                    }
                }
            }
            if (preResult.length === 0) {
                return this.filterOneSpecificProviderOutOfTheGivenProviderList(targetProvider, allProvidersWithEpisodes)
            }
            return this.filterOneSpecificProviderOutOfTheGivenProviderList(targetProvider, preResult)
        }
        return []
    }

    private static filterOneSpecificProviderOutOfTheGivenProviderList(
        targetProvider: ProviderLocalDataWithSeasonInfo,
        providerList: ProviderLocalDataWithSeasonInfo[]
    ): ProviderLocalDataWithSeasonInfo[] {
        return providerList.filter(x => x.providerLocalData.provider !== targetProvider.providerLocalData.provider)
    }

    private static isAnyOfEpisodeRatedEqualityContainerAlreadyBinded(
        episodeBindingPools: EpisodeBindingPool[],
        episodeRatedEqualityContainer: EpisodeRatedEqualityContainer
    ): boolean {
        const episodeBinds = episodeRatedEqualityContainer.episodeBinds
        for (let index = 0; index < episodeBinds.length; index++) {
            for (let index2 = index + 1; index2 < episodeBinds.length; index2++) {
                if (
                    EpisodeBindingPoolHelper.isEpisodeAlreadyBindedToAProvider(
                        episodeBindingPools,
                        episodeBinds[index].episode,
                        episodeBinds[index2].provider.provider
                    )
                ) {
                    return true
                }
            }
        }
        return false
    }

    private static getAllProviderThatContainsEpisodes(
        providers: ProviderLocalDataWithSeasonInfo[]
    ): ProviderLocalDataWithSeasonInfo[] {
        const listWithProvidersThatContainsEpisodes: ProviderLocalDataWithSeasonInfo[] = []
        for (const provider of providers) {
            if (this.containsProviderEpisodes(provider.providerLocalData)) {
                listWithProvidersThatContainsEpisodes.push(provider)
            }
        }
        return listWithProvidersThatContainsEpisodes
    }

    private static containsProviderEpisodes(localData: ProviderLocalData): boolean {
        if (this.detailedEpisodeIsPresent(localData) || this.episodesArePresent(localData)) {
            return true
        }
        return false
    }

    private static detailedEpisodeIsPresent(localData: ProviderLocalData): boolean {
        return localData.getAllDetailedEpisodes().length !== 0
    }

    private static episodesArePresent(localData: ProviderLocalData): boolean {
        return localData.episodes !== undefined
    }

    private static detailedEpisodeHasTitle(localData: ProviderLocalData): boolean {
        for (const episode of localData.getAllDetailedEpisodes()) {
            if (episode.title.length !== 0) {
                return true
            }
        }
        return false
    }

    /**
     * get all relevant episode bindings from other series.
     * (On season difference it can be helpfull to get the bindings from other season to calc the episode difference)
     */
    private static getAllEpisodeBindingsThatAreRelevant(
        providers: ProviderLocalDataWithSeasonInfo[]
    ): EpisodeBindingPool[] {
        const finalEpisodeBindingPool: EpisodeBindingPool[] = []
        const allProvidersWithNoUniqueIdAndDetailedEpisodes = this.getAllProvidersWithNoUniqueIdAndDetailedEpisodes(
            providers
        )
        for (const providersWithNoUniqueIdAndDetailedEpisodes of allProvidersWithNoUniqueIdAndDetailedEpisodes) {
            const providerId = providersWithNoUniqueIdAndDetailedEpisodes.providerLocalData.id
            const providerName = providersWithNoUniqueIdAndDetailedEpisodes.providerLocalData.provider
            const allSeriesWithProvider = MainListSearcher.findAllSeriesByProvider(providerId, providerName)
            finalEpisodeBindingPool.push(...allSeriesWithProvider.flatMap(x => x.episodeBindingPools))
        }
        return finalEpisodeBindingPool
    }

    private static getAllProvidersWithNoUniqueIdAndDetailedEpisodes(
        providers: ProviderLocalDataWithSeasonInfo[]
    ): ProviderLocalDataWithSeasonInfo[] {
        const allProvidersWithNoUniqueIdAndEpisodeTitles = []
        for (const provider of providers) {
            if (this.detailedEpisodeIsPresent(provider.providerLocalData)) {
                allProvidersWithNoUniqueIdAndEpisodeTitles.push(provider)
            }
        }
        return allProvidersWithNoUniqueIdAndEpisodeTitles
    }
}
