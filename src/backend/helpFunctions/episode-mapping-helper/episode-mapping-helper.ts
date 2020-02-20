import Episode from '../../controller/objects/meta/episode/episode';
import EpisodeBindingPool from '../../controller/objects/meta/episode/episode-binding-pool';
import EpisodeMapping from '../../controller/objects/meta/episode/episode-mapping';
import { EpisodeType } from '../../controller/objects/meta/episode/episode-type';
import Season from '../../controller/objects/meta/season';
import Series from '../../controller/objects/series';
import ProviderLocalData from '../../controller/provider-manager/local-data/interfaces/provider-local-data';
import ComperatorResult, { AbsoluteResult } from '../comperators/comperator-results.ts/comperator-result';
import EpisodeComperator from '../comperators/episode-comperator';
import EpisodeBindingPoolHelper from '../episode-binding-pool-helper';
import EpisodeHelper from '../episode-helper/episode-helper';
import listHelper from '../list-helper';
import sortHelper from '../sort-helper';
import EpisodeDifferenceContainer from './episode-difference-container';
import EpisodeProviderBind from './episode-provider-bind';
import EpisodeRatedEqualityContainer from './episode-rated-equality-container';
import ProviderCompareHistoryEntry from './provider-compare-history-entry';
import ProviderAndSeriesPackage from './provider-series-package';

export default class EpisodeMappingHelper {



    private static async sortingEpisodeRatedEqualityContainerByResultPoints(aEp: EpisodeRatedEqualityContainer, bEp: EpisodeRatedEqualityContainer) {
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
    private currentSeries: Series;
    private providers: ProviderLocalData[];
    constructor(series: Series) {
        this.currentSeries = series;
        this.providers = [...this.currentSeries.getAllProviderLocalDatas()];
    }
    public async generateEpisodeMapping(): Promise<EpisodeBindingPool[]> {
        const season = (await this.currentSeries.getSeason());
        const currentPackages = ProviderAndSeriesPackage.generatePackages(this.providers, this.currentSeries);
        await this.prepareDetailedEpisodeInformation(this.providers, season);

        const ratedEquality: EpisodeRatedEqualityContainer[] = this.getRatedEqulityOfEpisodes(currentPackages, this.currentSeries.episodeBindingPools, season);

        await this.calculateMapping(currentPackages, ratedEquality, season);
        const unmappedEpisodesNumber = await this.getNumberOfUnmappedEpisodesFromProviders(this.providers);
        if (unmappedEpisodesNumber !== 0) {
            await this.createMappingForSequels(season, currentPackages);
        }

        return this.currentSeries.episodeBindingPools;
    }

    public async addMappingToEpisode(mapping: EpisodeMapping, episode: Episode): Promise<Episode> {
        let added = false;
        const list = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(this.currentSeries.episodeBindingPools, episode);
        for (const currentMapping of list) {
            if (mapping.provider === mapping.provider) {
                const index = list.indexOf(currentMapping);
                list[index] = mapping;
                added = true;
                break;
            }
        }
        if (!added) {
            this.currentSeries.addEpisodeMapping(mapping);
        }
        return episode;
    }

    private async createMappingForSequels(season: Season, currentPackages: ProviderAndSeriesPackage[]) {
        let sequel: Series | null = (await this.currentSeries.getSequel()).foundedSeries;
        if (sequel) {
            const mappedSequels = [sequel];
            const differenceProviders: EpisodeDifferenceContainer[] = [];

            do {
                for (const provider of this.providers) {
                    if (await this.getNumberOfUnmappedEpisodesFromProvider(provider, this.getProviderLength(this.providers)) === 0) {
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
            } while (await this.getNumberOfUnmappedEpisodesFromProviders([...sequel.getAllProviderLocalDatas(), ...this.providers]) !== 0);
        }
    }

    private async prepareDetailedEpisodeInformation(providers: ProviderLocalData[], season?: Season) {
        for (const provider of providers) {
            if (provider.episodes) {
                if (provider.episodes > provider.getDetailedEpisodeLength()) {
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

    private getMaxEpisodeNumber(episodes: Episode[]): number | undefined {
        if (episodes.length === 0) {
            return undefined;
        } else {
            const unfilteredList = episodes.map((o) => {
                if (!isNaN(o.episodeNumber as unknown as number)) {
                    return o.episodeNumber as unknown as number;
                }
            });
            const filteredList = unfilteredList.filter((x) => x !== undefined) as unknown as number[];
            return Math.max(...filteredList);
        }
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
            const list = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(this.currentSeries.episodeBindingPools, detailEpisodeinfo);
            if (list.length !== providersLength - 1) {
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
    private async calculateMapping(packages: ProviderAndSeriesPackage[], ratedEquality: EpisodeRatedEqualityContainer[], season?: Season, cDiff = 0): Promise<EpisodeBindingPool[]> {
        for (const providerAndSeriesPackage of packages) {
            const currentBindingPools = providerAndSeriesPackage.series.episodeBindingPools;
            for (const episode of providerAndSeriesPackage.provider.detailEpisodeInfo) {
                const currentDiff = cDiff;
                if (ratedEquality.length === 0) {
                    ratedEquality = this.getRatedEqulityOfEpisodes(packages, currentBindingPools, season, currentDiff);
                    if (ratedEquality.length === 0) {
                        break;
                    }
                }

                const combineRatings = await this.getAllRelatedRatings(episode, providerAndSeriesPackage.provider, ratedEquality);
                if (combineRatings.length !== 0) {
                    const results = await this.getBestResultsFromEpisodeRatedEqualityContainer(combineRatings, this.getProviderLength(packages.flatMap((x) => x.provider)));
                    for (const result of results) {
                        if (!this.isAnyOfEpisodeRatedEqualityContainerAlreadyBinded(currentBindingPools, result)) {

                            providerAndSeriesPackage.series.addEpisodeMapping(...result.getEpisodeMappings());
                            const ratings: EpisodeRatedEqualityContainer[] = [];
                            for (const epsiodeBind of result.episodeBinds) {
                                ratings.push(...this.getAllEpisodeRelatedRating(epsiodeBind.episode, ratedEquality));
                            }
                            listHelper.removeEntrysSync(ratedEquality, ...ratings);
                            break;
                        }
                    }
                }
            }
        }
        return packages.flatMap((x) => x.series.episodeBindingPools);
    }

    private isAnyOfEpisodeRatedEqualityContainerAlreadyBinded(episodeBindingPools: EpisodeBindingPool[], episodeRatedEqualityContainer: EpisodeRatedEqualityContainer): boolean {
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
        let providerIsMapped = false;
        for (const episodeA of providerA.detailEpisodeInfo) {
            for (const episodeB of providerB.detailEpisodeInfo) {
                if (this.isEpisodeAlreadyMappedToEpisode(episodeA, episodeB, this.currentSeries.episodeBindingPools)) {
                    const difference = EpisodeHelper.getEpisodeDifference(episodeA, episodeB);
                    if (difference > maxEpisodeDifference) {
                        maxEpisodeDifference = difference;
                    }
                    break;
                } else if (this.isProviderInMapping(episodeA, providerB.provider)){
                    providerIsMapped = true;
                } else if (providerIsMapped) {
                    const difference = EpisodeHelper.getEpisodeDifference(episodeA, episodeB);
                    if (difference > maxEpisodeDifference) {
                        maxEpisodeDifference = difference;
                    }
                    providerIsMapped = false;
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
    private getRatedEqulityOfEpisodes(providers: ProviderAndSeriesPackage[], currentBindingPool: EpisodeBindingPool[], season?: Season, cdiff = 0): EpisodeRatedEqualityContainer[] {
        const ratedEquality: EpisodeRatedEqualityContainer[] = [];
        const alreadyComparedProviders = [];
        for (const packageA of providers) {
            for (const packageB of providers) {
                const providerA = packageA.provider;
                const providerB = packageB.provider;
                if (!this.canProviderPerformARatingEquality(providerA, providerB)) {
                    continue;
                }

                let episodeDiff = this.getMaxEpisodeShiftingDifference(providerA, providerB);

                /**
                 * Provider A targetSeason.
                 */
                const aTargetS = packageA.series.getProviderSeasonTarget(providerA.provider);

                /**
                 * Provider A targetSeason.
                 */
                const bTargetS = packageB.series.getProviderSeasonTarget(providerB.provider);

                if (aTargetS?.seasonPart !== bTargetS?.seasonPart) {
                    continue;
                }

                /**
                 * TODO fix tests
                 */
                if (this.isProviderAlreadyGotCompared(providerA, providerB, aTargetS, bTargetS, episodeDiff, alreadyComparedProviders)) {
                    continue;
                }

                if (providerB.detailEpisodeInfo.length !== 0) {
                    const performResult = this.performRatingEqualityOfEpisodes(providerA, providerB, aTargetS, bTargetS, season, currentBindingPool, episodeDiff);
                    ratedEquality.push(...performResult);
                    alreadyComparedProviders.push(new ProviderCompareHistoryEntry(providerA, providerB, aTargetS, bTargetS, episodeDiff));
                }
            }
        }
        return ratedEquality;
    }

    private canProviderPerformARatingEquality(providerA: ProviderLocalData, providerB: ProviderLocalData): boolean {
        if (providerA.provider === providerB.provider) {
            return false;
        } else if (providerA.detailEpisodeInfo.length === 0 || providerB.detailEpisodeInfo.length === 0) {
            return false;
        }
        return true;
    }

    // tslint:disable-next-line: max-line-length
    private performRatingEqualityOfEpisodes(providerA: ProviderLocalData, providerB: ProviderLocalData, aTargetS: Season | undefined, bTargetS: Season | undefined, season: Season | undefined, currentBindingPool: EpisodeBindingPool[], episodeDiff: number): EpisodeRatedEqualityContainer[] {
        const ratedEquality: EpisodeRatedEqualityContainer[] = [];
        let fastCheck = 0;
        let fastStreakEnabled = true;

        let providerAEpDiff = episodeDiff;
        for (const detailedEpA of providerA.detailEpisodeInfo) {
            for (let index = fastCheck; index < providerB.detailEpisodeInfo.length; index++) {
                const detailedEpB = providerB.detailEpisodeInfo[index];
                let result = this.getRatedEqualityContainer(detailedEpA, detailedEpB, providerA, providerB, aTargetS, bTargetS, season, currentBindingPool, providerAEpDiff);
                if (result !== undefined) {
                    if ((result.result.matchAble === result.result.matches && result.result.matchAble !== 0 && result.result.isAbsolute !== AbsoluteResult.ABSOLUTE_FALSE) || result.result.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE) {
                        if (fastStreakEnabled) {
                            fastCheck++;
                        }
                    } else if (fastStreakEnabled) {
                        if (fastCheck !== 0) {
                            index = 0;
                        }
                        fastCheck = 0;
                        fastStreakEnabled = false;
                    }

                    if (result.result.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE) {
                        const oldDiff = providerAEpDiff;
                        providerAEpDiff = EpisodeHelper.getEpisodeDifference(detailedEpA, detailedEpB);
                        if (oldDiff !== providerAEpDiff) {
                            const resultWithNewDiff = this.getRatedEqualityContainer(detailedEpA, detailedEpB, providerA, providerB, aTargetS, bTargetS, season, currentBindingPool, providerAEpDiff);
                            if (resultWithNewDiff !== undefined && resultWithNewDiff.episodeBinds.length !== 0) {
                                result = resultWithNewDiff;
                            }
                        }
                    }
                    if (result.episodeBinds.length !== 0 && result.result.isAbsolute !== AbsoluteResult.ABSOLUTE_FALSE) {
                        ratedEquality.push(result);
                    }
                    if (fastStreakEnabled) {
                        break;
                    }
                } else {
                    if (fastCheck !== 0) {
                        index = 0;
                    }
                    fastCheck = 0;
                    fastStreakEnabled = false;
                }
            }
        }
        return ratedEquality;
    }

    /**
     * TODO
     * @param detailedEpA 
     * @param detailedEpB 
     * @param providerA 
     * @param providerB 
     * @param aTargetS 
     * @param bTargetS 
     * @param season 
     * @param episodeDiff 
     */
    private getRatedEqualityContainer(detailedEpA: Episode, detailedEpB: Episode, providerA: ProviderLocalData, providerB: ProviderLocalData, aTargetS: Season | undefined, bTargetS: Season | undefined, season: Season | undefined, currentBindingPool: EpisodeBindingPool[], episodeDiff: number) {
        if ((!this.episodeIsAlreadyMappedToProvider(detailedEpA, providerB, currentBindingPool) && !this.episodeIsAlreadyMappedToProvider(detailedEpB, providerA, currentBindingPool))) {
            const result = EpisodeComperator.compareDetailedEpisode(detailedEpA, detailedEpB, aTargetS, bTargetS, season, episodeDiff);
            if (result.matches !== 0) {
                const epA = new EpisodeProviderBind(detailedEpA, providerA);
                const epB = new EpisodeProviderBind(detailedEpB, providerB);
                return new EpisodeRatedEqualityContainer(result, epA, epB);
            }
        } else {
            if (this.isEpisodeAlreadyMappedToEpisode(detailedEpA, detailedEpB, currentBindingPool) && this.isEpisodeAlreadyMappedToEpisode(detailedEpB, detailedEpA, currentBindingPool)) {
                const result = new ComperatorResult();
                result.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                return new EpisodeRatedEqualityContainer(result);
            }
        }
    }

    private filterOutRatingsThatAreAlreadyThere(erecB: EpisodeRatedEqualityContainer[], erecA: EpisodeRatedEqualityContainer, cProviderName: string): boolean {
        if (erecB.includes(erecA)) {
            return false;
        }
        for (const episode of erecA.episodeBinds) {
            if (this.isProviderInMapping(episode.episode, cProviderName)) {
                return false;
            }
        }
        return true;
    }

    private isProviderInMapping(episode: Episode, providerName: string): boolean {
        if (this.currentSeries.episodeBindingPools.length !== 0 && episode.provider !== providerName) {
            const list = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(this.currentSeries.episodeBindingPools, episode);
            for (const mapping of list) {
                if (mapping.provider === providerName) {
                    return true;
                }
            }
        }
        return false;
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

    private getAllEpisodeRelatedRatingWithRelatedProvider(episode: Episode, provider: ProviderLocalData, ratedEqualityList: EpisodeRatedEqualityContainer[]): EpisodeRatedEqualityContainer[] {
        const result: EpisodeRatedEqualityContainer[] = [];
        for (const rating of ratedEqualityList) {
            if (this.hasEpisodeBindThisEpisodes(rating.episodeBinds, episode)) {
                if (rating.episodeBinds.find((x) => x.provider.provider === provider.provider) !== undefined) {
                    result.push(rating);
                }
            }
        }
        return result;
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

    /**
     *
     * @param re
     * @param nOfProviders default is 2
     */
    private async getBestResultsFromEpisodeRatedEqualityContainer(re: EpisodeRatedEqualityContainer[], nOfProviders = 2): Promise<EpisodeRatedEqualityContainer[]> {
        const sorted = await sortHelper.quickSort(re, async (a, b) => EpisodeMappingHelper.sortingEpisodeRatedEqualityContainerByResultPoints(a, b));
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
                    tempEpisode.type = EpisodeType.REGULAR_EPISODE;
                    generatedEpisodes.push(tempEpisode);
                }
            }
        }
        return generatedEpisodes;
    }

    private isEpisodeAlreadyMappedToEpisode(episode: Episode, possibleMappedEpisode: Episode, current: EpisodeBindingPool[]): boolean {
        const list = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(current, episode);
        for (const mappedEpisodes of list) {
            if (mappedEpisodes.id === possibleMappedEpisode.id) {
                return true;
            }
        }
        return false;
    }

    private episodeIsAlreadyMappedToProvider(episode: Episode, provider: ProviderLocalData, currentBindingPool: EpisodeBindingPool[]): boolean {
        const list = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(currentBindingPool, episode);
        for (const episodeMapping of list) {
            if (episodeMapping.provider === provider.provider &&
                episodeMapping.providerSeriesId === provider.id &&
                episodeMapping.mappingVersion === EpisodeMapping.currentMappingVersion) {
                return true;
            }
        }
        return false;
    }
}
