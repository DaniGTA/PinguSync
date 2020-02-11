import Episode from '../../controller/objects/meta/episode/episode';
import { EpisodeType } from '../../controller/objects/meta/episode/episode-type';
import Season from '../../controller/objects/meta/season';
import { AbsoluteResult } from '../comperators/comperator-results.ts/comperator-result';
import EpisodeComperator from '../comperators/episode-comperator';
import SeasonComperator from '../comperators/season-comperator';
import listHelper from '../list-helper';
import EpisodeRelationResult from './episode-relation-result';

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
                    if (episode.season !== undefined && episode.season.seasonNumber !== undefined) {
                        seasonNumbers.push(episode.season.seasonNumber);
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
        const finalSeasonNumber = listHelper.getMostFrequentNumberFromList(seasonNumbers);
        const maxEpisodes = this.getRegularEpisodeCountOfSeason(seasonHolder, new Season(finalSeasonNumber));
        return new EpisodeRelationResult(finalSeasonNumber, maxEpisodes, numberOfRegularEpisodesFound, maxEpisodeNumber, maxDifference);
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

    public static sortingEpisodeListByEpisodeNumber(episodes: Episode[], season?: Season): Episode[] {
        return episodes.sort((a, b) => this.sortingEpisodeComperator(a, b, season));
    }

    private static sortingEpisodeComperator(a: Episode, b: Episode, season?: Season): number {
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
        } else if (EpisodeComperator.isEpisodeASeasonHigher(a, b, season)) {
            return -1;
        } else {
            return 1;
        }
    }

}

