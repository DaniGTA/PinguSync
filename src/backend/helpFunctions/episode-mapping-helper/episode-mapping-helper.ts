import ProviderLocalData from '../../controller/interfaces/provider-local-data';
import Series from '../../controller/objects/series';
import Episode from '../../controller/objects/meta/episode/episode';
import EpisodeMapping from '../../controller/objects/meta/episode/episode-mapping';
import EpisodeComperator from '../comperators/episode-comperator';
import ListController from '../../controller/list-controller';
import { EpisodeType } from '../../controller/objects/meta/episode/episode-type';
import sortHelper from '../sort-helper';
import EpisodeRatedEqualityContainer from './episode-rated-equality-container';

export default class EpisodeMappingHelper {

    async generateEpisodeMapping(series: Series): Promise<Episode[]> {
        const providers = series.getAllProviderLocalDatas();
        const season = (await series.getSeason()).seasonNumber;
        for (const provider of providers) {
            if (provider.episodes) {
                if (provider.episodes > await provider.getDetailedEpisodeLength()) {
                    const generatedEpisodes = await this.generateMissingEpisodes(provider, season);
                    provider.detailEpisodeInfo.push(...generatedEpisodes);
                }
            }
        }
        const ratedEquality: EpisodeRatedEqualityContainer[] = [];

        for (const providerA of providers) {
            for (let detailedEpisodeA of providerA.detailEpisodeInfo) {
                for (const providerB of providers) {
                    if (providerA.provider == providerB.provider) {
                        continue;
                    }
                    for (const detailedEpisodeB of providerB.detailEpisodeInfo) {
                        if (!await this.episodeIsAlreadyMapped(detailedEpisodeB, providerA) && !await this.isAlreadyRated(detailedEpisodeA, detailedEpisodeB, ratedEquality)) {
                            const result = await EpisodeComperator.compareDetailedEpisode(detailedEpisodeA, detailedEpisodeB, season);
                            const container = new EpisodeRatedEqualityContainer(result, detailedEpisodeA, detailedEpisodeB);
                            container.providerA = providerA;
                            container.providerB = providerB;
                            if (result.matches != 0) {
                                ratedEquality.push(container);
                            }
                        }
                    }
                }
            }
        }

        for (const provider of providers) {
            for (const episode of provider.detailEpisodeInfo) {
                const ratings: EpisodeRatedEqualityContainer[] = await this.getAllEpisodeRelatedRating(episode, ratedEquality);
                const tempRating: EpisodeRatedEqualityContainer[] = []
                for (const rating of ratings) {
                    let mappingCandidate = rating.episodeA;
                    if (await this.isSameEpisodeID(rating.episodeA, episode)) {
                        mappingCandidate = rating.episodeB;
                    }
                    const mappingCandidateRatings = await this.getAllEpisodeRelatedRating(mappingCandidate, ratedEquality);
                    const uniqResults = mappingCandidateRatings.filter(a => !ratings.includes(a));
                    tempRating.push(...uniqResults);
                }
                const combineRatings: EpisodeRatedEqualityContainer[] = [...ratings, ...tempRating];
                if (combineRatings.length != 0) {
                    const result = await this.getBestResultFromEpisodeRatedEqualityContainer(combineRatings);
                    if (await this.isSameEpisodeID(episode, result.episodeA)) {
                        if (result.providerB) {
                            const mappingB = new EpisodeMapping(result.episodeB, result.providerB);
                            episode.addMapping(mappingB);
                        }
                    } else if (await this.isSameEpisodeID(episode, result.episodeB)) {
                        if (result.providerA) {
                            const mappingB = new EpisodeMapping(result.episodeA, result.providerA);
                            episode.addMapping(mappingB);
                        }
                    }
                }

            }
        }

        const episodes = providers.flatMap(x => x.detailEpisodeInfo);
        return episodes;
    }


    private async isAlreadyRated(episodeA: Episode, episodeB: Episode, ratedEqualityList: EpisodeRatedEqualityContainer[]): Promise<boolean> {
        for (const rateing of ratedEqualityList) {
            if (await this.isSameEpisodeID(episodeA, rateing.episodeA) && await this.isSameEpisodeID(episodeB, rateing.episodeB)) {
                return true;
            }
            if (await this.isSameEpisodeID(episodeB, rateing.episodeA) && await this.isSameEpisodeID(episodeA, rateing.episodeB)) {
                return true;
            }
        }

        return false;
    }

    private async getAllEpisodeRelatedRating(episode: Episode, ratedEqualityList: EpisodeRatedEqualityContainer[]): Promise<EpisodeRatedEqualityContainer[]> {
        const result: EpisodeRatedEqualityContainer[] = [];
        for (const rating of ratedEqualityList) {
            if (await this.isSameEpisodeID(episode, rating.episodeA) || await this.isSameEpisodeID(episode, rating.episodeB)) {
                result.push(rating);
            }
        }
        return result;

    }

    /**
     * Checks if `a` and `b` have the same id.
     * @param a episode a will be compared with b
     * @param b episode b will be compared with a
     */
    private async isSameEpisodeID(a: Episode, b: Episode): Promise<boolean> {
        return a.id == b.id;
    }

    private async getEpisodeNumberDifference(a: Episode, b: Episode): Promise<number> {
        const difference = Math.abs(a.episodeNumber - b.episodeNumber);
        return difference;
    }

    private async getBestResultFromEpisodeRatedEqualityContainer(ratedEquality: EpisodeRatedEqualityContainer[]): Promise<EpisodeRatedEqualityContainer> {
        const sorted = await sortHelper.quickSort(ratedEquality, async (a, b) => await this.sortingEpisodeRatedEqualityContainerByResultPoints(a, b));
        if (sorted[0]) {
            if (sorted[0].result.matches != 0) {
                return sorted[0];
            }
        }
        throw 'no results in rated equality container'
    }

    private async generateMissingEpisodes(provider: ProviderLocalData, season?: number): Promise<Episode[]> {
        const generatedEpisodes: Episode[] = [];
        if (provider.episodes) {
            const numberOfMissingEpisodes = provider.episodes - await provider.getDetailedEpisodeLength();
            for (let episode = 1; episode <= numberOfMissingEpisodes; episode++) {
                let episodeFounded = false;
                for (const detailedEpisode of provider.detailEpisodeInfo) {
                    if (await EpisodeComperator.isEpisodeSameAsDetailedEpisode(episode, detailedEpisode, season)) {
                        episodeFounded = true;
                        break;
                    }
                }
                if (!episodeFounded) {
                    const tempEpisode = new Episode(episode);
                    tempEpisode.provider = provider.provider;
                    tempEpisode.type = EpisodeType.REGULAR_EPISODE;
                    generatedEpisodes.push(tempEpisode);
                }
            }
        }
        return generatedEpisodes;
    }

    private async episodeIsAlreadyMapped(episode: Episode, provider: ProviderLocalData): Promise<boolean> {
        for (const episodeMapping of episode.mappedTo) {
            if (episodeMapping.provider == provider.provider && episodeMapping.mappingVersion == EpisodeMapping.currentMappingVersion) {
                return true;
            }
        }
        return false;
    }

    public async addMappingToEpisode(mapping: EpisodeMapping, episode: Episode): Promise<Episode> {
        let added = false;
        for (const currentMapping of episode.mappedTo) {
            if (mapping.provider == mapping.provider) {
                const index = episode.mappedTo.indexOf(currentMapping);
                episode.mappedTo[index] = mapping;
                added = true;
                break;
            }
        }
        if (!added) {
            episode.mappedTo.push(mapping);
        }
        return episode;
    }

    private async sortingEpisodeRatedEqualityContainerByResultPoints(aEpisode: EpisodeRatedEqualityContainer, bEpisode: EpisodeRatedEqualityContainer) {
        const a = aEpisode.result.matches;
        const b = bEpisode.result.matches;
        if (a > b) {
            return -1;
        } else if (b > a) {
            return 1;
        } else if (aEpisode.result.matchAble > bEpisode.result.matchAble) {
            return 1;
        } else if (bEpisode.result.matchAble > aEpisode.result.matchAble) {
            return -1;
        } else {
            return 0;
        }
    }

    public async sortingEpisodeListByEpisodeNumber(episodes: Episode[], season?: number): Promise<Episode[]> {
        return sortHelper.quickSort(episodes, async (a, b) => await this.sortingEpisodeComperator(a, b, season));
    }

    public async sortingEpisodeComperator(a: Episode, b: Episode, season?: number): Promise<number> {
        if ((a.type == EpisodeType.SPECIAL && b.type != EpisodeType.SPECIAL)) {
            return 1;
        } else if (b.type == EpisodeType.SPECIAL && a.type != EpisodeType.SPECIAL) {
            return -1;
        }
        if (await EpisodeComperator.isEpisodeSameSeason(a, b, season)) {
            if (a.episodeNumber > b.episodeNumber) {
                return 1
            } else {
                return -1
            }
        } else if (await EpisodeComperator.isEpisodeASeasonHigher(a, b, season)) {
            return 1;
        } else {
            return -1;
        }
    }


}
