import Episode from '../../controller/objects/meta/episode/episode';
import EpisodeMapping from '../../controller/objects/meta/episode/episode-mapping';
import { EpisodeType } from '../../controller/objects/meta/episode/episode-type';
import Season from '../../controller/objects/meta/season';
import EpisodeComperator from '../comperators/episode-comperator';
import { AbsoluteResult } from '../comperators/comperator-results.ts/comperator-result';
import e from 'express';
import listHelper from '../list-helper';

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

    public static getEpisodeDifference(episodeA: Episode, episodeB: Episode): number {
        const a = episodeA.getEpNrAsNr();
        const b = episodeB.getEpNrAsNr();
        if (a !== undefined && b !== undefined) {
            return a - b;
        }
        return 0;
    }

    public static getEpisodeAndEpisodeMappingDifference(episodeA: Episode, episodeMappingB: EpisodeMapping): number {
        if (episodeA.isEpisodeNumberARealNumber() && !isNaN(episodeMappingB.episodeNumber as number)) {
            return episodeA.getEpNrAsNr() ?? 0 - (episodeMappingB.episodeNumber as number);
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

    public static getEpisodeFromArrayWithEpisode(ep: Episode, oldArr: Episode[]): Episode | undefined {
        for (const oldEp of oldArr) {
            const result = EpisodeComperator.compareDetailedEpisode(ep, oldEp);
            if (result.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE || result.isAbsolute === AbsoluteResult.ABSOLUTE_NONE || result.matchAble === result.matches) {
                return oldEp;
            }
        }
        return;
    }

    public static getMaxEpisodeNumberFromArray(episodeArray: Episode[]): number | undefined {
        let episodeNumber: number | undefined;
        for (const episode of episodeArray) {
            const currentEpisodeNumber = episode.getEpNrAsNr();
            if (episodeNumber === undefined) {
                episodeNumber = currentEpisodeNumber;
            } else if (currentEpisodeNumber !== undefined && episodeNumber < currentEpisodeNumber) {
                episodeNumber = currentEpisodeNumber;
            }
        }
        return episodeNumber;
    }

    public static groupBySeriesIds(episodeArray: Episode[]): Episode[][] {
        const arraySeriesIdBinding: (string | number | null)[] = [];
        const finalGroupedArray: Episode[][] = [];
        for (let index = 0; index < episodeArray.length; index++) {
            const element = episodeArray[index];
            let index2 = arraySeriesIdBinding.findIndex((x) => x === element.providerId ?? null);
            if (index2 === -1) {
                index2 = finalGroupedArray.push([element]);
                arraySeriesIdBinding[index2 - 1] = element.providerId ?? null;
            } else {
                finalGroupedArray[index2].push(element);
            }
        }
        return finalGroupedArray;
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

