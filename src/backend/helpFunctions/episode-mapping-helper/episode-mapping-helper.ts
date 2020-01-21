import Episode from '../../controller/objects/meta/episode/episode';
import EpisodeMapping from '../../controller/objects/meta/episode/episode-mapping';
import { EpisodeType } from '../../controller/objects/meta/episode/episode-type';
import Season from '../../controller/objects/meta/season';
import Series from '../../controller/objects/series';
import ProviderLocalData from '../../controller/provider-manager/local-data/interfaces/provider-local-data';
import EpisodeComperator from '../comperators/episode-comperator';
import listHelper from '../list-helper';
import sortHelper from '../sort-helper';
import EpisodeDifferenceContainer from './episode-difference-container';
import EpisodeProviderBind from './episode-provider-bind';
import EpisodeRatedEqualityContainer from './episode-rated-equality-container';
import ProviderCompareHistoryEntry from './provider-compare-history-entry';
import ProviderAndSeriesPackage from './provider-series-package';

export default class EpisodeMappingHelper {

    public async generateEpisodeMapping(series: Series): Promise<Episode[]> {
        const providers = [...series.getAllProviderLocalDatas()];
        const season = (await series.getSeason());
        const currentPackages = ProviderAndSeriesPackage.generatePackages(providers, series);
        await this.prepareDetailedEpisodeInformation(providers, season);

        const ratedEquality: EpisodeRatedEqualityContainer[] = this.getRatedEqulityOfEpisodes(currentPackages, season);

        await this.calculateMapping(currentPackages, ratedEquality, season);
        const unmappedEpisodesNumber = await this.getNumberOfUnmappedEpisodesFromProviders(providers);
        if (unmappedEpisodesNumber !== 0) {
            let sequel: Series | null = (await series.getSequel()).foundedSeries;
            if (sequel) {
                const mappedSequels = [sequel];
                const differenceProviders: EpisodeDifferenceContainer[] = [];

                do {
                    for (const provider of providers) {
                        if (await this.getNumberOfUnmappedEpisodesFromProvider(provider, this.getProviderLength(providers)) === 0) {
                            const sequelProvider = sequel.getAllProviderLocalDatas().find((x) => x.provider === provider.provider);
                            if (sequelProvider) {
                                if (!differenceProviders.find((x) => x.providerNameA.provider === provider.provider)) {
                                    const firstDiff = this.getMaxEpisodeNumber(provider.detailEpisodeInfo);
                                    differenceProviders.push(new EpisodeDifferenceContainer(provider, provider, firstDiff));
                                }
                                await this.prepareDetailedEpisodeInformation([sequelProvider], season);
                                const diff = this.getMaxEpisodeNumber(sequelProvider.detailEpisodeInfo);
                                const currentDiff = this.getEpisodeDifferenceFromContainer(differenceProviders, provider);
                                const sequelSeasonNumber = (await sequel.getSeason());
                                const sequelPackages = ProviderAndSeriesPackage.generatePackages([sequelProvider], sequel);
                                await this.calculateMapping([...currentPackages, ...sequelPackages], [], sequelSeasonNumber, currentDiff);
                                differenceProviders.push(new EpisodeDifferenceContainer(provider, sequelProvider, diff));
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

    public async sortingEpisodeListByEpisodeNumber(episodes: Episode[], season?: Season): Promise<Episode[]> {
        return sortHelper.quickSort(episodes, async (a, b) => this.sortingEpisodeComperator(a, b, season));
    }

    public async sortingEpisodeComperator(a: Episode, b: Episode, season?: Season): Promise<number> {
        if ((a.type === EpisodeType.SPECIAL && b.type !== EpisodeType.SPECIAL)) {
            return 1;
        } else if (b.type === EpisodeType.SPECIAL && a.type !== EpisodeType.SPECIAL) {
            return -1;
        }
        if (EpisodeComperator.isEpisodeSameSeason(a, b, season)) {
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

    private async prepareDetailedEpisodeInformation(providers: ProviderLocalData[], season?: Season) {
        for (const provider of providers) {
            if (provider.episodes) {
                if (provider.episodes > await provider.getDetailedEpisodeLength()) {
                    const generatedEpisodes = await this.generateMissingEpisodes(provider, season);
                    provider.addDetailedEpisodeInfos(...generatedEpisodes);
                }
            }
        }
    }

    private getEpisodeDifferenceFromContainer(episodeDifferenceContainers: EpisodeDifferenceContainer[], provider: ProviderLocalData): number {
        let diff = 0;
        for (const episodeDifference of episodeDifferenceContainers) {
            if (episodeDifference.providerNameA === provider) {
                diff += episodeDifference.diff;
            }

        }
        return diff;
    }

    private getMaxEpisodeNumber(episodes: Episode[]): number {
        const unfilteredList = episodes.map((o) => {
            if (!isNaN(o.episodeNumber as unknown as number)) {
                return o.episodeNumber as unknown as number;
            }
        });
        const filteredList = unfilteredList.filter((x) => x !== undefined) as unknown as number[];
        return Math.max(...filteredList);
    }

    private async getNumberOfUnmappedEpisodesFromProviders(providers: ProviderLocalData[]): Promise<number> {
        let unmappedEpisode: number = 0;
        for (const provider of providers) {
            unmappedEpisode += await this.getNumberOfUnmappedEpisodesFromProvider(provider, this.getProviderLength(providers));
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


    private getProviderLength(providers: ProviderLocalData[]): number {
        const differentProviders = [...new Set(providers.map((x) => x.provider))];
        return differentProviders.length;
    }

    /**
     * This function will create the mappings between same episodes from different providers.
     * @param packages the providers that should get mapped.
     * @param ratedEquality the first ratings.
     * @param season the season of the series.
     */
    private async calculateMapping(packages: ProviderAndSeriesPackage[], ratedEquality: EpisodeRatedEqualityContainer[], season?: Season, cDiff = 0): Promise<ProviderLocalData[]> {
        for (const providerAndSeriesPackage of packages) {
            let currentDiff = cDiff;
            for (let episode of providerAndSeriesPackage.provider.detailEpisodeInfo) {
                if (ratedEquality.length === 0) {
                    ratedEquality = this.getRatedEqulityOfEpisodes(packages, season, currentDiff);
                    if (ratedEquality.length === 0) {
                        break;
                    }
                }
                const combineRatings = await this.getAllRelatedRatings(episode, providerAndSeriesPackage.provider, ratedEquality);
                if (combineRatings.length !== 0) {
                    const results = await this.getBestResultsFromEpisodeRatedEqualityContainer(combineRatings, this.getProviderLength(packages.flatMap((x) => x.provider)));
                    for (const result of results) {
                        for (const episodeBind of result.episodeBinds) {
                            if (!this.isSameEpisodeID(episode, episodeBind.episode)) {
                                if (!this.isProviderInMapping(episode, episodeBind.provider.provider)) {
                                    const mappingB = new EpisodeMapping(episodeBind.episode, episodeBind.provider);
                                    if (!episode.addMapping) {
                                        episode = Object.assign(new Episode(episode.episodeNumber), episode);
                                    }
                                    episode.addMapping(mappingB);

                                    const mapping = new EpisodeMapping(episode, providerAndSeriesPackage.provider);
                                    this.updateMappingInProvider(episodeBind.episode, episodeBind.provider, mapping, packages.flatMap((x) => x.provider));
                                    const diff = this.getEpisodeNumberDifference(episode, episodeBind.episode);
                                    if (diff !== currentDiff) {
                                        currentDiff = diff;
                                        ratedEquality = [];
                                    } else {
                                        const ratingsA: EpisodeRatedEqualityContainer[] = this.getAllEpisodeRelatedRating(episode, ratedEquality);
                                        const ratingsB: EpisodeRatedEqualityContainer[] = this.getAllEpisodeRelatedRating(episodeBind.episode, ratedEquality);
                                        listHelper.removeEntrysSync(ratedEquality, ...ratingsA, ...ratingsB);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return packages.flatMap((x) => x.provider);
    }

    private async getAllRelatedRatings(ep: Episode, provider: ProviderLocalData, rEquality: EpisodeRatedEqualityContainer[]): Promise<EpisodeRatedEqualityContainer[]> {
        const ratings: EpisodeRatedEqualityContainer[] = this.getAllEpisodeRelatedRating(ep, rEquality);
        const tempRating: EpisodeRatedEqualityContainer[] = [];
        for (const rating of ratings) {
            for (const ratingEpisodeBind of rating.episodeBinds) {
                if (this.isSameEpisodeID(ratingEpisodeBind.episode, ep)) {
                    continue;
                }

                const mappingCandidateRatings = this.getAllEpisodeRelatedRating(ratingEpisodeBind.episode, rEquality);
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
    /**
     *
     *
     * @private
     * @param {ProviderLocalData[]} providers
     * @param {Series} series
     * @param {number} [season]
     * @param {number} [cdiff=0]
     * @returns {Promise<EpisodeRatedEqualityContainer[]>}
     * @memberof EpisodeMappingHelper
     */
    private getRatedEqulityOfEpisodes(providers: ProviderAndSeriesPackage[], season?: Season, cdiff = 0): EpisodeRatedEqualityContainer[] {
        const ratedEquality: EpisodeRatedEqualityContainer[] = [];
        const alreadyComparedProviders = [];
        for (const packageA of providers) {
            for (const packageB of providers) {
                const providerA = packageA.provider;
                const providerB = packageB.provider;
                if (providerA.provider === providerB.provider) {
                    continue;
                }

                let episodeDiff = cdiff;
                if (episodeDiff === 0) {
                    episodeDiff = this.getMaxEpisodeShiftingDifference(providerA, providerB);
                }

                /**
                 * Provider A targetSeason.
                 */
                const aTargetS = packageA.series.getProviderSeasonTarget(providerA.provider);
                /**
                 * Provider A targetSeason.
                 */
                const bTargetS = packageB.series.getProviderSeasonTarget(providerB.provider);
                /**
                 * TODO fix tests
                 */
                if (this.isProviderAlreadyGotCompared(providerA, providerB, aTargetS, bTargetS, episodeDiff, alreadyComparedProviders)) {
                    continue;
                }

                if (providerB.detailEpisodeInfo.length !== 0) {
                    const performResult = this.performRatingEqualityOfEpisodes(providerA, providerB, aTargetS, bTargetS, season, episodeDiff);
                    ratedEquality.push(...performResult);
                    alreadyComparedProviders.push(new ProviderCompareHistoryEntry(providerA, providerB, aTargetS, bTargetS, episodeDiff));
                }
            }
        }
        return ratedEquality;
    }

    // tslint:disable-next-line: max-line-length
    private performRatingEqualityOfEpisodes(providerA: ProviderLocalData, providerB: ProviderLocalData, aTargetS: Season | undefined, bTargetS: Season | undefined, season: Season | undefined, episodeDiff: number): EpisodeRatedEqualityContainer[] {
        const ratedEquality: EpisodeRatedEqualityContainer[] = [];
        let fastCheck = 0;
        for (const detailedEpA of providerA.detailEpisodeInfo) {
            if (providerB.detailEpisodeInfo.length > fastCheck) {
                const detailedEpB = providerB.detailEpisodeInfo[fastCheck];
                if (!this.episodeIsAlreadyMappedToProvider(detailedEpB, providerA)) {
                    if (!this.episodeIsAlreadyMappedToProvider(detailedEpA, providerB)) {
                        const result = EpisodeComperator.compareDetailedEpisode(detailedEpA, detailedEpB, aTargetS, bTargetS, season, episodeDiff);
                        if (result.matches !== 0 && result.matchAble === result.matches) {
                            const epA = new EpisodeProviderBind(detailedEpA, providerA);
                            const epB = new EpisodeProviderBind(providerB.detailEpisodeInfo[fastCheck], providerB);
                            const container = new EpisodeRatedEqualityContainer(result, epA, epB);
                            ratedEquality.push(container);
                            fastCheck++;
                            continue;
                        }
                    }
                }
            }
            for (const detailedEpB of providerB.detailEpisodeInfo) {
                if (!this.isEpisodeAlreadyRated(detailedEpA, detailedEpB, ratedEquality)) {
                    if (!this.episodeIsAlreadyMappedToProvider(detailedEpB, providerA)) {
                        if (!this.episodeIsAlreadyMappedToProvider(detailedEpA, providerB)) {
                            const result = EpisodeComperator.compareDetailedEpisode(detailedEpA, detailedEpB, aTargetS, bTargetS, season, episodeDiff);
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

    private updateMappingInProvider(tempEpisode: Episode, tempProvider: ProviderLocalData, mapping: EpisodeMapping, providers: ProviderLocalData[]): void {
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

    private isProviderAlreadyGotCompared(providerA: ProviderLocalData, providerB: ProviderLocalData, providerASeason: Season | undefined, providerBSeason: Season | undefined, diff: number, list: ProviderCompareHistoryEntry[]): boolean {
        for (const entry of list) {
            const result = entry.isItTheSame(providerA, providerB, providerASeason, providerBSeason, diff);
            if (result) {
                return true;
            }
        }
        return false;
    }

    private isEpisodeAlreadyRated(episodeA: Episode, episodeB: Episode, ratedEqualityList: EpisodeRatedEqualityContainer[]): boolean {

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

    private getAllEpisodeRelatedRating(episode: Episode, ratedEqualityList: EpisodeRatedEqualityContainer[]): EpisodeRatedEqualityContainer[] {
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
        if (!isNaN(a.episodeNumber as number) && !isNaN(b.episodeNumber as number)) {
            const difference = Math.abs((a.episodeNumber as unknown as number) - (b.episodeNumber as unknown as number));
            return difference;
        } else {
            return 0;
        }
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
    private async generateMissingEpisodes(provider: ProviderLocalData, season?: Season): Promise<Episode[]> {
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
        if (a < b) {
            return 1;
        } else if (a > b) {
            return -1;
        } else if (aEp.result.matchAble < bEp.result.matchAble) {
            return -1;
        } else if (aEp.result.matchAble > bEp.result.matchAble) {
            return 1;
        } else {
            return 0;
        }
    }
}
