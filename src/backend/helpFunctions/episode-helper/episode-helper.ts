import Episode from '../../controller/objects/meta/episode/episode';
import EpisodeMapping from '../../controller/objects/meta/episode/episode-mapping';
import { EpisodeType } from '../../controller/objects/meta/episode/episode-type';
import Season from '../../controller/objects/meta/season';
import EpisodeComperator from '../comperators/episode-comperator';
import { AbsoluteResult } from '../comperators/comperator-results.ts/comperator-result';

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

    public static getOldEpInOldArrayWithNew(ep: Episode, oldArr: Episode[]): Episode | undefined {
        for (const oldEp of oldArr) {
            const result = EpisodeComperator.compareDetailedEpisode(ep, oldEp);
            if (result.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE || result.matchAble === result.matches) {
                return oldEp;
            }
        }
        return;
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

