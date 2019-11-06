import Episode from '../../controller/objects/meta/episode/episode';
import EpisodeMapping from '../../controller/objects/meta/episode/episode-mapping';
import { EpisodeType } from '../../controller/objects/meta/episode/episode-type';
import Series from '../../controller/objects/series';
import ProviderLocalData from '../../controller/provider-manager/local-data/interfaces/provider-local-data';
import EpisodeComperator from '../comperators/episode-comperator';
import listHelper from '../list-helper';
import sortHelper from '../sort-helper';
import EpisodeDifferenceContainer from './episode-difference-container';
import EpisodeProviderBind from './episode-provider-bind';
import EpisodeRatedEqualityContainer from './episode-rated-equality-container';

export default class EpisodeMappingHelper {

    public async generateEpisodeMapping(series: Series): Promise<Episode[]> {
        const providers = [...series.getAllProviderLocalDatas()];
        const season = (await series.getSeason()).seasonNumber;
        await this.prepareDetailedEpisodeInformation(providers, season);

        const ratedEquality: EpisodeRatedEqualityContainer[] = await this.getRatedEqulityOfEpisodes(providers, season);

        await this.calculateMapping(providers, ratedEquality, season);
        const unmappedEpisodesNumber = await this.getNumberOfUnmappedEpisodesFromProviders(providers);
        if (unmappedEpisodesNumber !== 0) {
            let sequel: Series | null = (await series.getSequel()).foundedSeries;
            if (sequel) {
                const mappedSequels = [sequel];
                const differenceProviders: EpisodeDifferenceContainer[] = [];
                do {
                    for (const provider of providers) {
                        if (await this.getNumberOfUnmappedEpisodesFromProvider(provider, await this.getProviderLength(providers)) === 0) {
                            const sequelProvider = sequel.getAllProviderLocalDatas().find((x) => x.provider === provider.provider);
                            if (sequelProvider) {
                                await this.prepareDetailedEpisodeInformation([sequelProvider], season);
                                const diff = await this.getMaxEpisodeNumber(sequelProvider);
                                differenceProviders.push(new EpisodeDifferenceContainer(provider, sequelProvider, diff));
                                const currentDiff = await this.getEpisodeDifferenceFromContainer(differenceProviders, provider);
                                const sequelSeasonNumber = (await sequel.getSeason()).seasonNumber;
                                await this.calculateMapping([...providers, sequelProvider], [], sequelSeasonNumber, currentDiff);
                            }
                        }
                    }
                    const nextSequel: Series | null = (await sequel.getSequel()).foundedSeries;
                    if (nextSequel && !mappedSequels.includes(nextSequel)) {
                        sequel = nextSequel;
                        mappedSequels.push(nextSequel);
                    } else {
                        break;
                    }
                } while (await this.getNumberOfUnmappedEpisodesFromProviders([...sequel.getAllProviderLocalDatas(), ...providers]) !== 0);
            }
        }
        const episodes = providers.flatMap((x) => x.detailEpisodeInfo);
        return episodes;
    }

    public async addMappingToEpisode(mapping: EpisodeMapping, episode: Episode): Promise<Episode> {
        let added = false;
        for (const currentMapping of episode.mappedTo) {
            if (mapping.provider === mapping.provider) {
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

    public async sortingEpisodeListByEpisodeNumber(episodes: Episode[], season?: number): Promise<Episode[]> {
        return sortHelper.quickSort(episodes, async (a, b) => this.sortingEpisodeComperator(a, b, season));
    }

    public async sortingEpisodeComperator(a: Episode, b: Episode, season?: number): Promise<number> {
        if ((a.type === EpisodeType.SPECIAL && b.type !== EpisodeType.SPECIAL)) {
            return 1;
        } else if (b.type === EpisodeType.SPECIAL && a.type !== EpisodeType.SPECIAL) {
            return -1;
        }
        if (await EpisodeComperator.isEpisodeSameSeason(a, b, season)) {
            if (a.episodeNumber > b.episodeNumber) {
                return 1;
            } else {
                return -1;
            }
        } else if (await EpisodeComperator.isEpisodeASeasonHigher(a, b, season)) {
            return 1;
        } else {
            return -1;
        }
    }

    private async prepareDetailedEpisodeInformation(providers: ProviderLocalData[], season?: number) {
        for (const provider of providers) {
            if (provider.episodes) {
                if (provider.episodes > await provider.getDetailedEpisodeLength()) {
                    const generatedEpisodes = await this.generateMissingEpisodes(provider, season);
                    provider.detailEpisodeInfo.push(...generatedEpisodes);
                }
            }
        }
    }

    private async getEpisodeDifferenceFromContainer(episodeDifferenceContainers: EpisodeDifferenceContainer[], provider: ProviderLocalData) {
        let diff = 0;
        for (const episodeDifference of episodeDifferenceContainers) {
            if (episodeDifference.providerNameA === provider) {
                diff += episodeDifference.diff;
            }

        }
        return diff;
    }

    private async getMaxEpisodeNumber(provider: ProviderLocalData): Promise<number> {
        return Math.max.apply(Math, provider.detailEpisodeInfo.map((o) => o.episodeNumber));

    }

    private async getNumberOfUnmappedEpisodesFromProviders(providers: ProviderLocalData[]): Promise<number> {
        let unmappedEpisode: number = 0;
        for (const provider of providers) {
            unmappedEpisode += await this.getNumberOfUnmappedEpisodesFromProvider(provider, await this.getProviderLength(providers));
        }
        return unmappedEpisode;
    }

    private async getNumberOfUnmappedEpisodesFromProvider(provider: ProviderLocalData, providersLength = 0): Promise<number> {
        let unmappedEpisode: number = 0;
        for (const detailEpisodeinfo of provider.detailEpisodeInfo) {
            if (detailEpisodeinfo.mappedTo.length !== providersLength - 1) {
                unmappedEpisode++;
            }
        }
        return unmappedEpisode;
    }


    private async getProviderLength(providers: ProviderLocalData[]): Promise<number> {
        const differentProviders = [...new Set(providers.map((x) => x.provider))];
        return differentProviders.length;
    }

    /**
     * This function will create the mappings between same episodes from different providers.
     * @param providers the providers that should get mapped.
     * @param ratedEquality the first ratings.
     * @param season the season of the series.
     */
    private async calculateMapping(providers: ProviderLocalData[], ratedEquality: EpisodeRatedEqualityContainer[], season?: number, cDiff = 0): Promise<ProviderLocalData[]> {
        for (const provider of providers) {
            let currentDiff = cDiff;
            for (let episode of provider.detailEpisodeInfo) {
                if (ratedEquality.length === 0) {
                    ratedEquality = await this.getRatedEqulityOfEpisodes(providers, season, currentDiff);
                    if (ratedEquality.length === 0) {
                        break;
                    }
                }
                const combineRatings = await this.getAllRelatedRatings(episode, provider, ratedEquality);
                if (combineRatings.length !== 0) {
                    const results = await this.getBestResultsFromEpisodeRatedEqualityContainer(combineRatings, await this.getProviderLength(providers));
                    for (const result of results) {
                        for (const episodeBind of result.episodeBinds) {
                            if (!this.isSameEpisodeID(episode, episodeBind.episode)) {
                                const mappingB = new EpisodeMapping(episodeBind.episode, episodeBind.provider);
                                if (!episode.addMapping) {
                                    episode = Object.assign(new Episode(episode.episodeNumber), episode);
                                }
                                episode.addMapping(mappingB);

                                const mapping = new EpisodeMapping(episode, provider);
                                await this.updateMappingInProvider(episodeBind.episode, episodeBind.provider, mapping, providers);
                                const diff = this.getEpisodeNumberDifference(episode, episodeBind.episode);
                                if (diff !== currentDiff) {
                                    currentDiff = diff;
                                    ratedEquality = [];
                                } else {
                                    const ratingsA: EpisodeRatedEqualityContainer[] = await this.getAllEpisodeRelatedRating(episode, ratedEquality);
                                    const ratingsB: EpisodeRatedEqualityContainer[] = await this.getAllEpisodeRelatedRating(episodeBind.episode, ratedEquality);
                                    await listHelper.removeEntrys(ratedEquality, ...ratingsA, ...ratingsB);
                                }
                            }
                        }
                    }
                }
            }
        }
        return providers;
    }

    private async getAllRelatedRatings(ep: Episode, provider: ProviderLocalData, rEquality: EpisodeRatedEqualityContainer[]): Promise<EpisodeRatedEqualityContainer[]> {
        const ratings: EpisodeRatedEqualityContainer[] = await this.getAllEpisodeRelatedRating(ep, rEquality);
        const tempRating: EpisodeRatedEqualityContainer[] = [];
        for (const rating of ratings) {
            for (const ratingEpisodeBind of rating.episodeBinds) {
                if (this.isSameEpisodeID(ratingEpisodeBind.episode, ep)) {
                    continue;
                }

                const mappingCandidateRatings = await this.getAllEpisodeRelatedRating(ratingEpisodeBind.episode, rEquality);
                const uniqResults = mappingCandidateRatings.filter((a) => this.filterOutRatingsThatAreAlreadyThere(ratings, a, provider.provider));
                tempRating.push(...uniqResults);
            }
        }
        return [...ratings, ...tempRating];
    }

    private getMaxEpisodeShiftingDifference(providerA: ProviderLocalData, providerB: ProviderLocalData): number {
        let maxEpisodeDifference = 0;
        for (const episodeA of providerA.detailEpisodeInfo) {
            for (const episodeB of providerB.detailEpisodeInfo) {
                if (this.isEpisodeAlreadyMappedToEpisode(episodeA, episodeB)) {
                    const difference = this.getEpisodeNumberDifference(episodeA, episodeB);
                    if (difference > maxEpisodeDifference) {
                        maxEpisodeDifference = difference;
                    }
                    break;
                }
            }
        }
        return maxEpisodeDifference;
    }

    private async getRatedEqulityOfEpisodes(providers: ProviderLocalData[], season?: number, cdiff = 0): Promise<EpisodeRatedEqualityContainer[]> {
        const ratedEquality: EpisodeRatedEqualityContainer[] = [];
        for (const providerA of providers) {
            for (const providerB of providers) {
                if (providerA.provider === providerB.provider) {
                    continue;
                }
                let episodeDifference = cdiff;
                if (episodeDifference === 0) {
                    episodeDifference = this.getMaxEpisodeShiftingDifference(providerA, providerB);
                }
                let fastCheck = 0;
                if (providerB.detailEpisodeInfo.length !== 0) {
                    for (const detailedEpA of providerA.detailEpisodeInfo) {
                        if (providerB.detailEpisodeInfo.length > fastCheck) {
                            const detailedEpB = providerB.detailEpisodeInfo[fastCheck];
                            const result = await EpisodeComperator.compareDetailedEpisode(detailedEpA, detailedEpB, season, episodeDifference);
                            if (result.matches !== 0 && result.matchAble === result.matches) {
                                const epA = new EpisodeProviderBind(detailedEpA, providerA);
                                const epB = new EpisodeProviderBind(providerB.detailEpisodeInfo[fastCheck], providerB);
                                const container = new EpisodeRatedEqualityContainer(result, epA, epB);
                                ratedEquality.push(container);
                                fastCheck++;
                                continue;
                            }
                        }
                        for (const detailedEpB of providerB.detailEpisodeInfo) {
                            if (!this.isAlreadyRated(detailedEpA, detailedEpB, ratedEquality)) {
                                if (!this.episodeIsAlreadyMappedToProvider(detailedEpB, providerA)) {
                                    if (!this.episodeIsAlreadyMappedToProvider(detailedEpA, providerB)) {
                                        const result = await EpisodeComperator.compareDetailedEpisode(detailedEpA, detailedEpB, season, episodeDifference);
                                        if (result.matches !== 0) {
                                            const epA = new EpisodeProviderBind(detailedEpA, providerA);
                                            const epB = new EpisodeProviderBind(detailedEpB, providerB);
                                            const container = new EpisodeRatedEqualityContainer(result, epA, epB);
                                            ratedEquality.push(container);
                                            if (result.matchAble === result.matches) {
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return ratedEquality;
    }

    private filterOutRatingsThatAreAlreadyThere(ratings: EpisodeRatedEqualityContainer[], rating: EpisodeRatedEqualityContainer, currentProviderName: string): boolean {
        if (ratings.includes(rating)) {
            return false;
        }
        for (const episode of rating.episodeBinds) {
            if (this.isProviderInMapping(episode.episode, currentProviderName)) {
                return false;
            }
        }
        return true;
    }

    private isProviderInMapping(episode: Episode, providerName: string): boolean {
        if (episode.mappedTo.length !== 0 && episode.provider !== providerName) {
            for (const mapping of episode.mappedTo) {
                if (mapping.provider === providerName) {
                    return true;
                }
            }
        }
        return false;
    }

    private async updateMappingInProvider(tempEpisode: Episode, tempProvider: ProviderLocalData, mapping: EpisodeMapping, providers: ProviderLocalData[]): Promise<void> {
        for (const provider of providers) {
            if (tempProvider.provider === provider.provider) {
                for (let episode of tempProvider.detailEpisodeInfo) {
                    if (episode.id === tempEpisode.id) {
                        if (episode.addMapping) {
                            episode.addMapping(mapping);
                        } else {
                            episode = Object.assign(new Episode(0), episode);
                            episode.addMapping(mapping);
                        }
                    }
                }
                break;
            }
        }
        return;
    }

    private isAlreadyRated(episodeA: Episode, episodeB: Episode, ratedEqualityList: EpisodeRatedEqualityContainer[]): boolean {

        for (const rateing of ratedEqualityList) {
            let result = true;
            for (const episodeBind of rateing.episodeBinds) {
                if (!(this.isSameEpisodeID(episodeA, episodeBind.episode) || this.isSameEpisodeID(episodeB, episodeBind.episode))) {
                    result = false;
                }
            }
            if (result) {
                return result;
            }
        }
        return false;
    }

    private hasEpisodeBindThisEpisodes(episodeBinds: EpisodeProviderBind[], ...episodes: Episode[]): boolean {
        for (const episodeBind of episodeBinds) {
            let result = true;
            for (const episode of episodes) {
                if (this.isSameEpisodeID(episode, episodeBind.episode)) {
                    result = true;
                    break;
                } else {
                    result = false;
                }
            }

            if (result) {
                return result;
            }
        }
        return false;
    }

    private async getAllEpisodeRelatedRating(episode: Episode, ratedEqualityList: EpisodeRatedEqualityContainer[]): Promise<EpisodeRatedEqualityContainer[]> {
        const result: EpisodeRatedEqualityContainer[] = [];
        for (const rating of ratedEqualityList) {
            if (this.hasEpisodeBindThisEpisodes(rating.episodeBinds, episode)) {
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
    private isSameEpisodeID(a: Episode, b: Episode): boolean {
        return a.id === b.id;
    }

    private getEpisodeNumberDifference(a: Episode, b: Episode): number {
        const difference = Math.abs(a.episodeNumber - b.episodeNumber);
        return difference;
    }

    /**
     *
     * @param re
     * @param nOfProviders default is 2
     */
    private async getBestResultsFromEpisodeRatedEqualityContainer(re: EpisodeRatedEqualityContainer[], nOfProviders = 2): Promise<EpisodeRatedEqualityContainer[]> {
        const sorted = await sortHelper.quickSort(re, async (a, b) => this.sortingEpisodeRatedEqualityContainerByResultPoints(a, b));
        const results = [];
        for (let index = 0; index < nOfProviders - 1; index++) {
            if (sorted[index]) {
                if (sorted[index].result.matches !== 0) {
                    results.push(sorted[index]);
                }
            }
        }
        if (results.length !== 0) {
            return results;
        }
        throw new Error('no results in rated equality container');
    }

    /**
     * This converts a episode number to a list of episodes.
     * @param provider
     * @param season
     */
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

    private isEpisodeAlreadyMappedToEpisode(episode: Episode, possibleMappedEpisode: Episode): boolean {
        for (const mappedEpisodes of episode.mappedTo) {
            if (mappedEpisodes.id === possibleMappedEpisode.id) {
                return true;
            }
        }
        return false;
    }

    private episodeIsAlreadyMappedToProvider(episode: Episode, provider: ProviderLocalData): boolean {
        for (const episodeMapping of episode.mappedTo) {
            if (episodeMapping.provider === provider.provider && episodeMapping.mappingVersion === EpisodeMapping.currentMappingVersion) {
                return true;
            }
        }
        return false;
    }



    private async sortingEpisodeRatedEqualityContainerByResultPoints(aEp: EpisodeRatedEqualityContainer, bEp: EpisodeRatedEqualityContainer) {
        const a = aEp.result.matches;
        const b = bEp.result.matches;
        if (a > b) {
            return -1;
        } else if (b > a) {
            return 1;
        } else if (aEp.result.matchAble > bEp.result.matchAble) {
            return 1;
        } else if (bEp.result.matchAble > aEp.result.matchAble) {
            return -1;
        } else {
            return 0;
        }
    }
}
