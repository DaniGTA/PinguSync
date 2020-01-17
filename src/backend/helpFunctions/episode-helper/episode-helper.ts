import Episode from '../../controller/objects/meta/episode/episode';
import EpisodeComperator from '../comperators/episode-comperator';
import listHelper from '../list-helper';
import EpisodeRelationResult from './episode-relation-result';
import { EpisodeType } from 'src/backend/controller/objects/meta/episode/episode-type';

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
        for (const episode of seasonHolder) {
            for (const newEpisodes of currentSeason) {
                const result = EpisodeComperator.compareEpisodeTitle(episode, newEpisodes);
                if (result.matchAble === result.matches) {
                    if (episode.season !== undefined) {
                        seasonNumbers.push(episode.season);
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
        const maxEpisodes = this.getRegularEpisodeCountOfSeason(seasonHolder, finalSeasonNumber);
        return new EpisodeRelationResult(finalSeasonNumber, maxEpisodes, numberOfRegularEpisodesFound);
    }

    public static getRegularEpisodeCountOfSeason(episodes: Episode[], seasonNumber: number): number {
        let episodeCounter = 0;
        for (const episode of episodes) {
            if (episode.type === EpisodeType.UNKOWN || episode.type === EpisodeType.REGULAR_EPISODE) {
                if (episode.season === seasonNumber) {
                    episodeCounter++;
                }
            }
        }
        return episodeCounter;
    }

}

