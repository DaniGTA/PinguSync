import Episode from '../../controller/objects/meta/episode/episode';
import { EpisodeType } from '../../controller/objects/meta/episode/episode-type';
import Season from '../../controller/objects/meta/season';
import { AbsoluteResult } from '../comperators/comperator-results.ts/comperator-result';
import EpisodeComperator from '../comperators/episode-comperator';
import SeasonComperator from '../comperators/season-comperator';
import listHelper from '../list-helper';
import EpisodeRelationResult from './episode-relation-result';
import EpisodeMapping from '../../controller/objects/meta/episode/episode-mapping';

export default class EpisodeHelper {

    public static hasEpisodeNames(detailEpisodeInfos: Episode[]): boolean {
        let hasEpisodeNames = false;
        for (const detailEpisodeInfo of detailEpisodeInfos) {
            if (detailEpisodeInfo.title.length !== 0) {
                hasEpisodeNames = true;
                break;
            }
        }
        return hasEpisodeNames;
    }

    public static calculateRelationBetweenEpisodes(seasonHolder: Episode[], currentSeason: Episode[]): EpisodeRelationResult {
        const seasonNumbers: number[] = [];
        let numberOfRegularEpisodesFound = 0;
        let numberOfSpecialEpisodesFound = 0;
        let maxEpisodeNumber = 0;
        let maxDifference = 0;
        for (const episode of seasonHolder) {
            for (const newEpisodes of currentSeason) {
                const result = EpisodeComperator.compareEpisodeTitle(episode, newEpisodes);
                if (result.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE) {
                    const newEpisodeNumber = newEpisodes.episodeNumber as unknown as number;
                    if (!isNaN(newEpisodeNumber as unknown as number)) {
                        if (newEpisodeNumber > maxEpisodeNumber) {
                            maxEpisodeNumber = newEpisodeNumber;
                        }
                        const episodeNumber = episode.episodeNumber as unknown as number;
                        if (!isNaN(episode.episodeNumber as unknown as number)) {
                            let diff: number | null = null;
                            if (episodeNumber > newEpisodeNumber) {
                                diff = episodeNumber - newEpisodeNumber;
                            } else if (episodeNumber > newEpisodeNumber) {
                                diff = newEpisodeNumber - episodeNumber;
                            }
                            if (diff !== null && diff > maxDifference) {
                                maxDifference = diff;
                            }
                        }
                    }
                    if (episode.season !== undefined && episode.season.seasonNumbers !== undefined) {
                        seasonNumbers.push(...episode.season.seasonNumbers);
                    }
                    if (episode.type === EpisodeType.UNKOWN || episode.type === EpisodeType.REGULAR_EPISODE) {
                        numberOfRegularEpisodesFound++;
                    } else {
                        numberOfSpecialEpisodesFound++;
                    }
                    break;
                }
            }
        }
        const finalSeasonNumbers = listHelper.getUniqueList(seasonNumbers);
        let maxEpisodes = 0;
        for (const season of finalSeasonNumbers) {
            maxEpisodes += this.getRegularEpisodeCountOfSeason(seasonHolder, new Season([season]));
        }
        return new EpisodeRelationResult(finalSeasonNumbers, maxEpisodes, numberOfRegularEpisodesFound, maxEpisodeNumber, maxDifference);
    }

    public static getRegularEpisodeCountOfSeason(episodes: Episode[], seasonNumber: Season): number {
        let episodeCounter = 0;
        for (const episode of episodes) {
            if (episode.type === EpisodeType.UNKOWN || episode.type === EpisodeType.REGULAR_EPISODE) {
                if (SeasonComperator.isSameSeason(episode.season, seasonNumber)) {
                    episodeCounter++;
                }
            }
        }
        return episodeCounter;
    }

    public static getEpisodeDifference(episodeA: Episode, episodeB: Episode): number {
        if (episodeA.isEpisodeNumberARealNumber() && episodeB.isEpisodeNumberARealNumber()) {
            return episodeA.getEpNrAsNr() - episodeB.getEpNrAsNr();
        }
        return 0;
    }

    public static getEpisodeAndEpisodeMappingDifference(episodeA: Episode, episodeMappingB: EpisodeMapping): number {
        if (episodeA.isEpisodeNumberARealNumber() && !isNaN(episodeMappingB.episodeNumber as number)) {
            return episodeA.getEpNrAsNr() - (episodeMappingB.episodeNumber as number);
        }
        return 0;
    }

    public static sortingEpisodeListByEpisodeNumber(episodes: Episode[], season?: Season): Episode[] {
        return episodes.sort((a, b) => this.sortingEpisodeComperator(a, b, season));
    }

    /**
    * Checks if `a` and `b` have the same id.
    * @param a episode a will be compared with b
    * @param b episode b will be compared with a
    */
    public static isSameEpisodeID(a: Episode, b: Episode): boolean {
        return a.id === b.id;
    }

    private static sortingEpisodeComperator(a: Episode, b: Episode, season?: Season): number {
        if ((a.type === EpisodeType.SPECIAL && b.type !== EpisodeType.SPECIAL)) {
            return 1;
        } else if (b.type === EpisodeType.SPECIAL && a.type !== EpisodeType.SPECIAL) {
            return -1;
        }
        const result = EpisodeComperator.isEpisodeSameSeason(a, b, season);
        if (result.matchAble === result.matches) {
            if (a.episodeNumber > b.episodeNumber) {
                return 1;
            } else {
                return -1;
            }
        } else if (EpisodeComperator.isEpisodeASeasonHigher(a, b, season)) {
            return -1;
        } else {
            return 1;
        }
    }


}

