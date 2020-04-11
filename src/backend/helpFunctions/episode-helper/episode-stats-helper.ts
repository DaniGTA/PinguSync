import Episode from '../../controller/objects/meta/episode/episode';
import ProviderLocalData from '../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';

/**
 * Helps to get stats like max episode number or max season number.
 */
export default class EpisodeStatsHelper {
    public static getMaxEpisodeNumber(providerLocalData: ProviderLocalData): number {
        let maxEpisodeNumber = 0;
        if (providerLocalData.detailEpisodeInfo.length !== 0) {
            maxEpisodeNumber = this.getMaxEpisodeFromEpisodeList(providerLocalData.detailEpisodeInfo);
        } else {
            if (providerLocalData.episodes !== undefined) {
                maxEpisodeNumber = providerLocalData.episodes;
            } else {
                throw new Error('[EpisodeStatsHelper] cant get max episode number.');
            }
        }
        return maxEpisodeNumber;
    }

    public static getMaxEpisodeFromEpisodeList(list: Episode[]): number {
        let maxEpiosdeNumber = 0;
        for (const entry of list) {
            if (entry.isEpisodeNumberARealNumber()) {
                if (maxEpiosdeNumber < (entry.episodeNumber as number)) {
                    maxEpiosdeNumber = entry.episodeNumber as number;
                }
            }
        }
        return maxEpiosdeNumber;
    }

    public static getMaxSeasonNumberFromEpisodeList(list: Episode[]): number {
        let maxSeasonNumber = 0;
        for (const entry of list) {
            if (entry.season) {
                const seasonNumber = entry.season.getSingleSeasonNumberAsNumber();
                if (seasonNumber) {
                    if (maxSeasonNumber < seasonNumber) {
                        maxSeasonNumber = seasonNumber;
                    }
                }
            }
        }
        return maxSeasonNumber;
    }
}
