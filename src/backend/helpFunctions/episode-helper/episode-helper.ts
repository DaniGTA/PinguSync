import Episode from '../../controller/objects/meta/episode/episode';
import EpisodeComperator from '../comperators/episode-comperator';
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
        let numberOfEpisodesFound = 0;
        for (const episode of seasonHolder) {
            for (const newEpisodes of currentSeason) {
                const result = EpisodeComperator.compareEpisodeTitle(episode, newEpisodes);
                if (result.matchAble === result.matches) {
                    if (episode.season !== undefined) {
                        seasonNumbers.push(episode.season);
                    }
                    numberOfEpisodesFound++;
                    break;
                }
            }
        }
        const finalSeasonNumber = listHelper.getMostFrequentNumberFromList(seasonNumbers);
        const maxEpisodes = this.getEpisodeCountOfSeason(seasonHolder, finalSeasonNumber);
        return new EpisodeRelationResult(finalSeasonNumber, maxEpisodes, numberOfEpisodesFound);
    }

    public static getEpisodeCountOfSeason(episodes: Episode[], seasonNumber: number): number {
        let episodeCounter = 0;
        for (const episode of episodes) {
            if (episode.season === seasonNumber) {
                episodeCounter++;
            }
        }
        return episodeCounter;
    }

}

