import ProviderLocalData from '../../controller/interfaces/provider-local-data';
import Series from '../../controller/objects/series';
import Episode from '../../controller/objects/meta/episode/episode';
import EpisodeMapping from '../../controller/objects/meta/episode/episode-mapping';
import EpisodeComperator from '../comperators/episode-comperator';
import { EpisodeType } from '../../controller/objects/meta/episode/episode-type';
import sortHelper from '../sort-helper';
import EpisodeRatedEqualityContainer from './episode-rated-equality-container';
import listHelper from '../list-helper';
import EpisodeDifferenceContainer from './episode-difference-container';
import EpisodeProviderBind from './episode-provider-bind';

export default class EpisodeMappingHelper {

    async generateEpisodeMapping(series: Series): Promise<Episode[]> {
        console.log('[Episode] [Generate] Generate episode mapping.')
        const providers = [...series.getAllProviderLocalDatas()];
        const season = (await series.getSeason()).seasonNumber;
        await this.prepareDetailedEpisodeInformation(providers, season);

        let ratedEquality: EpisodeRatedEqualityContainer[] = await this.getRatedEqulityOfEpisodes(providers, season);

        await this.calculateMapping(providers, ratedEquality, season);
        const number = await this.getNumberOfUnmappedEpisodesFromProviders(providers)
        if (number != 0) {
            let sequel: Series | null = (await series.getSequel()).foundedSeries;
            if (sequel) {
                const mappedSequels = [sequel];
                let differenceProviders: EpisodeDifferenceContainer[] = [];
                do {
                    console.log('[Episode] [Generate] Sequel.')
                    for (const provider of providers) {
                        if (await this.getNumberOfUnmappedEpisodesFromProvider(provider, await this.getProviderLength(providers)) == 0) {
                            const sequelProvider = sequel.getAllProviderLocalDatas().find(x => x.provider == provider.provider);
                            if (sequelProvider) {
                                await this.prepareDetailedEpisodeInformation([sequelProvider], season);
                                const diff = await this.getMaxEpisodeNumber(sequelProvider);
                                differenceProviders.push(new EpisodeDifferenceContainer(provider, sequelProvider, diff));
                                const currentDiff = await this.getEpisodeDifferenceFromContainer(differenceProviders, provider);
                                await this.calculateMapping([...providers, sequelProvider], [], (await sequel.getSeason()).seasonNumber, currentDiff);
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
                } while (await this.getNumberOfUnmappedEpisodesFromProviders([...sequel.getAllProviderLocalDatas(), ...providers]) != 0)
            }
        }

        const episodes = providers.flatMap(x => x.detailEpisodeInfo);
        return episodes;
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
        console.log('[Episode] [GET] request episode difference from container.')
        let diff = 0;
        for (const episodeDifference of episodeDifferenceContainers) {
            if (episodeDifference.providerNameA == provider) {
                diff += episodeDifference.diff;
            }

        }
        return diff;
    }

    private async getMaxEpisodeNumber(provider: ProviderLocalData): Promise<number> {
        console.log('[Episode] [GET] request max episode number.')
        return Math.max.apply(Math, provider.detailEpisodeInfo.map(function (o) { return o.episodeNumber; }))

    }

    private async getNumberOfUnmappedEpisodesFromProviders(providers: ProviderLocalData[]): Promise<number> {
        console.log('[Episode] [GET] number of unmapped episodes.')
        let unmappedEpisode: number = 0;
        for (const provider of providers) {
            unmappedEpisode += await this.getNumberOfUnmappedEpisodesFromProvider(provider, await this.getProviderLength(providers))
        }
        return unmappedEpisode;
    }

    private async getNumberOfUnmappedEpisodesFromProvider(provider: ProviderLocalData, providersLength = 0): Promise<number> {
        let unmappedEpisode: number = 0;
        for (const detailEpisodeinfo of provider.detailEpisodeInfo) {
            if (detailEpisodeinfo.mappedTo.length != providersLength - 1) {
                unmappedEpisode++;
            }
        }
        return unmappedEpisode;
    }


    private async getProviderLength(providers: ProviderLocalData[]): Promise<number> {
        const differentProviders = [...new Set(providers.map(x => x.provider))];
        return differentProviders.length;
    }

    /**
     * This function will create the mappings between same episodes from different providers.
     * @param providers the providers that should get mapped.
     * @param ratedEquality the first ratings.
     * @param season the season of the series.
     */
    private async calculateMapping(providers: ProviderLocalData[], ratedEquality: EpisodeRatedEqualityContainer[], season?: number, cDiff = 0): Promise<ProviderLocalData[]> {
        console.log('[Episode] [CALC] calculate mapping.')
        for (const provider of providers) {
            let currentDiff = cDiff;
            for (const episode of provider.detailEpisodeInfo) {
                if (ratedEquality.length == 0) {
                    ratedEquality = await this.getRatedEqulityOfEpisodes(providers, season, currentDiff);
                    if (ratedEquality.length == 0) {
                        break;
                    }
                }
                const combineRatings = await this.getAllRelatedRatings(episode, provider, ratedEquality, season);
                if (combineRatings.length != 0) {
                    const results = await this.getBestResultsFromEpisodeRatedEqualityContainer(combineRatings, await this.getProviderLength(providers));
                    for (const result of results) {
                        for (const episodeBind of result.episodeBinds) {
                            if (!await this.isSameEpisodeID(episode, episodeBind.episode)) {
                                const mappingB = new EpisodeMapping(episodeBind.episode, episodeBind.provider);
                                await episode.addMapping(mappingB);

                                const mapping = new EpisodeMapping(episode, provider);
                                await this.updateMappingInProvider(episodeBind.episode, episodeBind.provider, mapping, providers);
                                const diff = await this.getEpisodeNumberDifference(episode, episodeBind.episode);
                                if (diff != currentDiff) {
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
                } else {

                }
            }
        }
        return providers;
    }

    private async getAllRelatedRatings(episode: Episode, provider: ProviderLocalData, ratedEquality: EpisodeRatedEqualityContainer[], season?: number): Promise<EpisodeRatedEqualityContainer[]> {

        const ratings: EpisodeRatedEqualityContainer[] = await this.getAllEpisodeRelatedRating(episode, ratedEquality);
        const tempRating: EpisodeRatedEqualityContainer[] = []
        for (const rating of ratings) {
            for (const ratingEpisodeBind of rating.episodeBinds) {
                if (await this.isSameEpisodeID(ratingEpisodeBind.episode, episode)) {
                    continue;
                }

                const mappingCandidateRatings = await this.getAllEpisodeRelatedRating(ratingEpisodeBind.episode, ratedEquality);
                const uniqResults = mappingCandidateRatings.filter(a => this.filterOutRatingsThatAreAlreadyThere(ratings, a, provider.provider));
                tempRating.push(...uniqResults);
            }
        }
        return [...ratings, ...tempRating];
    }

    private async getMaxEpisodeShiftingDifference(providerA: ProviderLocalData, providerB: ProviderLocalData): Promise<number> {
        let maxEpisodeDifference = 0;
        for (const episodeA of providerA.detailEpisodeInfo) {
            for (const episodeB of providerB.detailEpisodeInfo) {
                if (await this.isEpisodeAlreadyMappedToEpisode(episodeA, episodeB)) {
                    const difference = await this.getEpisodeNumberDifference(episodeA, episodeB);
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
        console.log('[Episode] [GET] number of unmapped episodes.')
        const ratedEquality: EpisodeRatedEqualityContainer[] = [];
        for (const providerA of providers) {
            console.log('[Episode] [CURRENT_TEMP_VALUE] ' + ratedEquality.length);
            for (const providerB of providers) {
                if (providerA.provider == providerB.provider) {
                    continue;
                }
                let episodeDifference = cdiff;
                if (episodeDifference == 0) {
                    episodeDifference = await this.getMaxEpisodeShiftingDifference(providerA, providerB);
                }
                let fastCheck = 0;
                if (providerB.detailEpisodeInfo.length != 0) {
                    for (let detailedEpisodeA of providerA.detailEpisodeInfo) {
                        if (providerB.detailEpisodeInfo.length > fastCheck) {
                            const result = await EpisodeComperator.compareDetailedEpisode(detailedEpisodeA, providerB.detailEpisodeInfo[fastCheck], season, episodeDifference);
                            if (result.matches != 0 && result.matchAble == result.matches) {
                                const epA = new EpisodeProviderBind(detailedEpisodeA, providerA);
                                const epB = new EpisodeProviderBind(providerB.detailEpisodeInfo[fastCheck], providerB);
                                const container = new EpisodeRatedEqualityContainer(result, epA, epB);
                                ratedEquality.push(container);
                                fastCheck++;
                                continue;
                            }
                        }
                        for (const detailedEpisodeB of providerB.detailEpisodeInfo) {
                            if (!await this.isAlreadyRated(detailedEpisodeA, detailedEpisodeB, ratedEquality)) {
                                if (!await this.episodeIsAlreadyMappedToProvider(detailedEpisodeB, providerA) && !await this.episodeIsAlreadyMappedToProvider(detailedEpisodeA, providerB)) {
                                    const result = await EpisodeComperator.compareDetailedEpisode(detailedEpisodeA, detailedEpisodeB, season, episodeDifference);
                                    if (result.matches != 0) {
                                        const epA = new EpisodeProviderBind(detailedEpisodeA, providerA);
                                        const epB = new EpisodeProviderBind(detailedEpisodeB, providerB);
                                        const container = new EpisodeRatedEqualityContainer(result, epA, epB);
                                        ratedEquality.push(container);
                                        if (result.matchAble == result.matches) {
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
        return ratedEquality;
    }

    private filterOutRatingsThatAreAlreadyThere(ratings: EpisodeRatedEqualityContainer[], rating: EpisodeRatedEqualityContainer, currentProviderName: string) {
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

    private isProviderInMapping(episode: Episode, providerName: string) {
        if (episode.mappedTo.length != 0 && episode.provider != providerName) {
            for (const mapping of episode.mappedTo) {
                if (mapping.provider == providerName) {
                    return true;
                }
            }
        }
        return false;
    }

    private async updateMappingInProvider(tempEpisode: Episode, tempProvider: ProviderLocalData, mapping: EpisodeMapping, providers: ProviderLocalData[]) {
        for (const provider of providers) {
            if (tempProvider.provider === provider.provider) {
                for (let episode of tempProvider.detailEpisodeInfo) {
                    if (episode.id == tempEpisode.id) {
                        if (episode.addMapping) {
                            await episode.addMapping(mapping);
                        } else {
                            episode = Object.assign(new Episode(0), episode);
                            episode.addMapping(mapping);
                        }
                    }
                }
                break;
            }
        }
    }

    private async isAlreadyRated(episodeA: Episode, episodeB: Episode, ratedEqualityList: EpisodeRatedEqualityContainer[]): Promise<boolean> {

        for (const rateing of ratedEqualityList) {
            let result = true;
            for (const episodeBind of rateing.episodeBinds) {
                if (!(await this.isSameEpisodeID(episodeA, episodeBind.episode) || await this.isSameEpisodeID(episodeB, episodeBind.episode))) {
                    result = false;
                }
            }
            if (result) {
                return result;
            }
        }
        return false;
    }

    private async hasEpisodeBindThisEpisodes(episodeBinds: EpisodeProviderBind[], ...episodes: Episode[]) {
        for (const episodeBind of episodeBinds) {
            let result = true;
            for (const episode of episodes) {
                if (await this.isSameEpisodeID(episode, episodeBind.episode)) {
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

    }

    private async getAllEpisodeRelatedRating(episode: Episode, ratedEqualityList: EpisodeRatedEqualityContainer[]): Promise<EpisodeRatedEqualityContainer[]> {
        const result: EpisodeRatedEqualityContainer[] = [];
        for (const rating of ratedEqualityList) {
            if (await this.hasEpisodeBindThisEpisodes(rating.episodeBinds, episode)) {
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

    /**
     * 
     * @param ratedEquality 
     * @param numberOfProviders default is 2
     */
    private async getBestResultsFromEpisodeRatedEqualityContainer(ratedEquality: EpisodeRatedEqualityContainer[], numberOfProviders = 2): Promise<EpisodeRatedEqualityContainer[]> {
        const sorted = await sortHelper.quickSort(ratedEquality, async (a, b) => await this.sortingEpisodeRatedEqualityContainerByResultPoints(a, b));
        const results = [];
        for (let index = 0; index < numberOfProviders - 1; index++) {
            if (sorted[index]) {
                if (sorted[index].result.matches != 0) {
                    results.push(sorted[index]);
                }
            }
        }
        if (results.length != 0) {
            return results;
        }
        throw 'no results in rated equality container'
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

    private async isEpisodeAlreadyMappedToEpisode(episode: Episode, possibleMappedEpisode: Episode) {
        for (const mappedEpisodes of episode.mappedTo) {
            if (mappedEpisodes.id == possibleMappedEpisode.id) {
                return true;
            }
        }
        return false;
    }

    private async episodeIsAlreadyMappedToProvider(episode: Episode, provider: ProviderLocalData): Promise<boolean> {
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
