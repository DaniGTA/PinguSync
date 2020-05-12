import Episode from '../../controller/objects/meta/episode/episode';
import EpisodeBindingPool from '../../controller/objects/meta/episode/episode-binding-pool';
import EpisodeMapping from '../../controller/objects/meta/episode/episode-mapping';
import { EpisodeType } from '../../controller/objects/meta/episode/episode-type';
import Season from '../../controller/objects/meta/season';
import ComperatorResult, { AbsoluteResult } from '../comperators/comperator-results.ts/comperator-result';
import EpisodeComperator from '../comperators/episode-comperator';
import SeasonComperator from '../comperators/season-comperator';
import EpisodeBindingPoolHelper from '../episode-binding-pool-helper';
import EpisodeHelper from '../episode-helper/episode-helper';
import ProviderLocalDataWithSeasonInfo from '../provider/provider-info-downloader/provider-data-with-season-info';
import SeasonHelper from '../season-helper/season-helper';
import EpisodeProviderBind from './objects/episode-provider-bind';
import EpisodeRatedEqualityContainer from './objects/episode-rated-equality-container';
import ProviderAndSeriesPackage from './objects/provider-series-package';
import ProviderLocalData from '../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';


export default class EpisodeRatedEqualityHelper {
    private static EPISODE_NUMBER_SEASON_TOLERANCE = 1;
    private allBindingPools: EpisodeBindingPool[] = [];
    private targetBindingPools: EpisodeBindingPool[];

    constructor(targetBindingPool: EpisodeBindingPool[], allBindingPools: EpisodeBindingPool[]) {
        this.allBindingPools = allBindingPools;
        this.targetBindingPools = targetBindingPool;
    }

    public getRatedEqualityFromTwoProviders(packageA: ProviderAndSeriesPackage, packageB: ProviderAndSeriesPackage, season?: Season): EpisodeRatedEqualityContainer[] {
        const providerA = packageA.provider;
        const providerB = packageB.provider;

        if ((providerA.seasonTarget?.seasonPart !== undefined &&
            providerB.seasonTarget?.seasonPart !== undefined) &&
            !SeasonComperator.isSameSeasonPartNumber(providerA.seasonTarget, providerB.seasonTarget)) {
            throw new Error(`Cant get rated equality between ${providerA.providerLocalData.provider} and ${providerB.providerLocalData.provider}`);
        }

        if (providerB.providerLocalData.detailEpisodeInfo.length !== 0 && providerA.providerLocalData.detailEpisodeInfo.length !== 0) {
            return this.performRatingEqualityOfEpisodes(providerA, providerB, season, this.targetBindingPools, 0);
        }
        return [];
    }

    private getAllRelevantEpisodes(provider: ProviderLocalDataWithSeasonInfo, otherProvider: ProviderLocalDataWithSeasonInfo) {
        const result: Episode[] = [];
        let diff = 0;
        let lastSuccessFullIndex = 0;
        const aNumberOfEpisodes = provider.providerLocalData.getAllRegularEpisodes(provider.seasonTarget).length;
        const bNumberOfEpisodes = otherProvider.providerLocalData.getAllRegularEpisodes(otherProvider.seasonTarget);

        let skipNotSameSeason = false;
        if (Math.abs(aNumberOfEpisodes - bNumberOfEpisodes.length) <= EpisodeRatedEqualityHelper.EPISODE_NUMBER_SEASON_TOLERANCE) {
            skipNotSameSeason = true;
        }
        for (const detailedEpA of provider.providerLocalData.detailEpisodeInfo) {
            if (result.includes(detailedEpA)) {
                continue;
            }
            if (skipNotSameSeason &&
                !SeasonHelper.isSeasonUndefined(detailedEpA.season) &&
                !SeasonComperator.isSameSeasonNumber(detailedEpA.season, provider.seasonTarget)) {
                continue;
            }
            if (!this.isSameProviderNameInMapping(detailedEpA, otherProvider.providerLocalData, this.allBindingPools)) {
                if (lastSuccessFullIndex < otherProvider.providerLocalData.detailEpisodeInfo.length) {
                    for (let index = lastSuccessFullIndex; index < otherProvider.providerLocalData.detailEpisodeInfo.length; index++) {
                        const detailedEpB = otherProvider.providerLocalData.detailEpisodeInfo[index];

                        if (skipNotSameSeason &&
                            !SeasonHelper.isSeasonUndefined(detailedEpB.season) &&
                            !SeasonComperator.isSameSeasonNumber(detailedEpB.season, otherProvider.seasonTarget)) {
                            lastSuccessFullIndex = index + 1;
                            continue;
                        }
                        if (this.isEpisodeAlreadyMappedToEpisode(detailedEpA, detailedEpB, this.targetBindingPools)) {
                            if (detailedEpA.isEpisodeNumberARealNumber() && detailedEpB.isEpisodeNumberARealNumber()) {
                                diff = detailedEpA.getEpNrAsNr() - detailedEpB.getEpNrAsNr();
                            }
                            result.push(detailedEpA);
                            lastSuccessFullIndex = index + 1;
                            break;
                        }
                        if (!this.isSameProviderNameInMapping(detailedEpB, provider.providerLocalData, this.allBindingPools)) {
                            result.push(detailedEpA);
                            if (detailedEpA.isEpisodeNumberARealNumber() && detailedEpB.isEpisodeNumberARealNumber()) {
                                if (detailedEpB.type !== EpisodeType.SPECIAL && detailedEpA.type !== EpisodeType.SPECIAL) {
                                    diff = detailedEpA.getEpNrAsNr() - detailedEpB.getEpNrAsNr();
                                }
                                lastSuccessFullIndex = index + 1;
                            }
                            break;
                        }
                    }
                } else {
                    result.push(detailedEpA);
                }
            }
        }
        return { result, diff };
    }

    // tslint:disable-next-line: max-line-length
    private performRatingEqualityOfEpisodes(providerA: ProviderLocalDataWithSeasonInfo, providerB: ProviderLocalDataWithSeasonInfo, season: Season | undefined, currentBindingPool: EpisodeBindingPool[], episodeDiff: number): EpisodeRatedEqualityContainer[] {
        const ratedEquality: EpisodeRatedEqualityContainer[] = [];
        const allRelevantResultA = this.getAllRelevantEpisodes(providerA, providerB);
        const allRelevantResultB = this.getAllRelevantEpisodes(providerB, providerA);
        let fastCheck = 0;
        let fastStreakEnabled = true;
        episodeDiff = allRelevantResultA.diff;
        let providerAEpDiff = episodeDiff;
        for (const detailedEpA of allRelevantResultA.result) {
            for (let index = fastCheck; index < allRelevantResultB.result.length; index++) {
                const detailedEpB = allRelevantResultB.result[index];
                let result = this.getRatedEqualityContainer(detailedEpA, detailedEpB, providerA, providerB, season, currentBindingPool, providerAEpDiff);
                if (result !== undefined) {
                    if (result.result.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE || (result.result.matchAble !== 0 &&
                        result.result.matchAble === result.result.matches &&
                        result.result.isAbsolute !== AbsoluteResult.ABSOLUTE_FALSE)) {
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
                            const resultWithNewDiff = this.getRatedEqualityContainer(detailedEpA, detailedEpB, providerA, providerB, season, currentBindingPool, providerAEpDiff);
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
    private getRatedEqualityContainer(detailedEpA: Episode, detailedEpB: Episode, providerAWithSeason: ProviderLocalDataWithSeasonInfo, providerBWithSeason: ProviderLocalDataWithSeasonInfo, season: Season | undefined, currentBindingPool: EpisodeBindingPool[], episodeDiff: number) {
        const providerA = providerAWithSeason.providerLocalData;
        const providerB = providerBWithSeason.providerLocalData;
        const aTargetS = providerAWithSeason.seasonTarget;
        const bTargetS = providerBWithSeason.seasonTarget;
        const result = EpisodeComperator.compareDetailedEpisode(detailedEpA, detailedEpB, aTargetS, bTargetS, season, episodeDiff);
        if (result.matches !== 0) {
            const epA = new EpisodeProviderBind(detailedEpA, providerA);
            const epB = new EpisodeProviderBind(detailedEpB, providerB);
            if ((!this.episodeIsAlreadyMappedToProvider(detailedEpA, providerB, currentBindingPool) &&
                !this.episodeIsAlreadyMappedToProvider(detailedEpB, providerA, currentBindingPool))) {

                return new EpisodeRatedEqualityContainer(result, epA, epB);
            } else {
                if (this.isEpisodeAlreadyMappedToEpisode(detailedEpA, detailedEpB, currentBindingPool) &&
                    this.isEpisodeAlreadyMappedToEpisode(detailedEpB, detailedEpA, currentBindingPool)) {
                    const trueResult = new ComperatorResult();
                    trueResult.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                    return new EpisodeRatedEqualityContainer(trueResult, epA, epB);
                }
            }
        }
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

    private isEpisodeAlreadyMappedToEpisode(episode: Episode, possibleMappedEpisode: Episode, current: EpisodeBindingPool[]): boolean {
        const list = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(current, episode);
        for (const mappedEpisodes of list) {
            if (mappedEpisodes.id === possibleMappedEpisode.id) {
                return true;
            }
        }
        return false;
    }

    private isSameProviderNameInMapping(episode: Episode, providerB: ProviderLocalData, bindingPools: EpisodeBindingPool[]): boolean {
        if (bindingPools.length !== 0 && episode.provider !== providerB.provider) {
            const list = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(this.getAllEpsidoeBindingPoolsThatAreRelated(), episode);
            for (const mapping of list) {
                if (mapping.provider === providerB.provider && (mapping.providerSeriesId !== providerB.id)) {
                    return true;
                }
            }
        }
        return false;
    }

    private getAllEpsidoeBindingPoolsThatAreRelated(): EpisodeBindingPool[] {
        return this.allBindingPools;
    }
}
