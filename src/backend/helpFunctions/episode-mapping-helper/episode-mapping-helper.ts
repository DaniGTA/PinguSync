import EpisodeBindingPool from '../../controller/objects/meta/episode/episode-binding-pool';
import Series from '../../controller/objects/series';
import ProviderDataWithSeasonInfo from '../provider/provider-info-downloader/provider-data-with-season-info';
import ProviderLocalData from '../../controller/provider-manager/local-data/interfaces/provider-local-data';
import EpisodeRatedEqualityHelper from './episode-rated-equality-helper';
import ProviderAndSeriesPackage from './provider-series-package';
import EpisodeRatedEqualityContainerHelper from './episode-rated-equality-container-helper';
import Episode from '../../controller/objects/meta/episode/episode';
import EpisodeComperator from '../comperators/episode-comperator';
import { EpisodeType } from '../../controller/objects/meta/episode/episode-type';
import Season from '../../controller/objects/meta/season';
import EpisodeBindingPoolHelper from '../episode-binding-pool-helper';
import EpisodeRatedEqualityContainer from './episode-rated-equality-container';
import logger from '../../logger/logger';

export default class EpisodeMappingHelper {
    /**
     * static getEpisodeMappings
     */
    public static async getEpisodeMappings(series: Series): Promise<EpisodeBindingPool[]> {
        const allProviders = series.getAllProviderLocalDatasWithSeasonInfo();
        const allEpisodeBindingPools = (await series.getAllRelations()).flatMap(x => x.episodeBindingPools);
        for (const provider of allProviders) {
            if (!this.detailedEpisodeIsPresent(provider.providerLocalData)) {
                const generateEpisodes = await this.generateMissingEpisodes(provider.providerLocalData, provider.seasonTarget);
                provider.providerLocalData.addDetailedEpisodeInfos(...generateEpisodes);
            }
        }

        for (const providerA of allProviders) {
            const compareToProviders = this.getAllProviderThatCanBeMappedToEpisodeOfProvider(providerA, allProviders);
            for (const providerB of compareToProviders) {
                try {
                    const ratingInstance = new EpisodeRatedEqualityHelper(series.episodeBindingPools, allEpisodeBindingPools);
                    const packageA = new ProviderAndSeriesPackage(providerA.providerLocalData, series);
                    const packageB = new ProviderAndSeriesPackage(providerB.providerLocalData, series);
                    const ratings = ratingInstance.getRatedEqualityFromTwoProviders(packageA, packageB);
                    const bestRatings = await EpisodeRatedEqualityContainerHelper.getBestResultsFromEpisodeRatedEqualityContainer(ratings);
                    for (const bestRating of bestRatings) {
                        if (!this.isAnyOfEpisodeRatedEqualityContainerAlreadyBinded(series.episodeBindingPools, bestRating)) {
                            series.addEpisodeMapping(...bestRating.getEpisodeMappings());
                        }
                    }
                } catch (err) {
                    logger.debug(err);
                }
            }
        }
        return series.episodeBindingPools;
    }

    private static getAllProviderThatCanBeMappedToEpisodeOfProvider(targetProvider: ProviderDataWithSeasonInfo, allProviders: ProviderDataWithSeasonInfo[]): ProviderDataWithSeasonInfo[] {
        if (this.containsProviderEpisodes(targetProvider.providerLocalData)) {
            const allProvidersWithEpisodes = this.getAllProviderThatContainsEpisodes(allProviders);
            const providerHasEpisodeTitles = this.detailedEpisodeHasTitle(targetProvider.providerLocalData);

            const preResult = [];
            for (const provider of allProvidersWithEpisodes) {
                if (targetProvider.providerLocalData.provider !== provider.providerLocalData.provider) {
                    if (providerHasEpisodeTitles && this.detailedEpisodeHasTitle(provider.providerLocalData)) {
                        preResult.push(provider);
                    } else if (targetProvider.providerLocalData.getAllRegularEpisodes().length === provider.providerLocalData.getAllRegularEpisodes().length) {
                        preResult.push(provider);
                    }
                }
            }
            if (preResult.length === 0) {
                return allProvidersWithEpisodes.filter(x => x.providerLocalData.provider !== targetProvider.providerLocalData.provider);
            }
            return preResult;
        }
        return [];
    }


    private static isAnyOfEpisodeRatedEqualityContainerAlreadyBinded(episodeBindingPools: EpisodeBindingPool[], episodeRatedEqualityContainer: EpisodeRatedEqualityContainer): boolean {
        const episodeBinds = episodeRatedEqualityContainer.episodeBinds;
        for (let index = 0; index < episodeBinds.length; index++) {
            for (let index2 = index + 1; index2 < episodeBinds.length; index2++) {
                if (EpisodeBindingPoolHelper.isEpisodeAlreadyBindedToAProvider(episodeBindingPools, episodeBinds[index].episode, episodeBinds[index2].provider.provider)) {
                    return true;
                }
            }
        }
        return false;
    }


    private static getAllProviderThatContainsEpisodes(providers: ProviderDataWithSeasonInfo[]): ProviderDataWithSeasonInfo[] {
        const listWithProvidersThatContainsEpisodes: ProviderDataWithSeasonInfo[] = [];
        for (const provider of providers) {
            if (this.containsProviderEpisodes(provider.providerLocalData)) {
                listWithProvidersThatContainsEpisodes.push(provider);
            }
        }
        return listWithProvidersThatContainsEpisodes;
    }

    private static containsProviderEpisodes(localData: ProviderLocalData): boolean {
        if (this.detailedEpisodeIsPresent(localData) || this.episodesArePresent(localData)) {
            return true;
        }
        return false;
    }

    private static detailedEpisodeIsPresent(localData: ProviderLocalData) {
        return localData.detailEpisodeInfo.length !== 0;
    }

    private static episodesArePresent(localData: ProviderLocalData) {
        return localData.episodes !== undefined;
    }

    private static detailedEpisodeHasTitle(localData: ProviderLocalData) {
        for (const episode of localData.detailEpisodeInfo) {
            if (episode.title.length !== 0) {
                return true;
            }
        }
        return false;
    }

    /**
 * This converts a episode number to a list of episodes.
 * @param provider
 * @param season
 */
    private static async generateMissingEpisodes(provider: ProviderLocalData, season?: Season): Promise<Episode[]> {
        const generatedEpisodes: Episode[] = [];
        if (provider.episodes) {
            const numberOfMissingEpisodes = provider.episodes - provider.getDetailedEpisodeLength();
            for (let episode = 1; episode <= numberOfMissingEpisodes; episode++) {
                let episodeFounded = false;
                for (const detailedEpisode of provider.detailEpisodeInfo) {
                    if (EpisodeComperator.isEpisodeSameAsDetailedEpisode(episode, detailedEpisode, season)) {
                        episodeFounded = true;
                        break;
                    }
                }
                if (!episodeFounded) {
                    const tempEpisode = new Episode(episode);
                    tempEpisode.provider = provider.provider;
                    tempEpisode.providerId = provider.id;
                    tempEpisode.type = EpisodeType.REGULAR_EPISODE;
                    generatedEpisodes.push(tempEpisode);
                }
            }
        }
        return generatedEpisodes;
    }
}
