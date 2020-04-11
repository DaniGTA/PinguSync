import Episode from '../../controller/objects/meta/episode/episode';
import { EpisodeType } from '../../controller/objects/meta/episode/episode-type';
import Season from '../../controller/objects/meta/season';
import ProviderLocalData from '../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import ProviderList from '../../controller/provider-controller/provider-manager/provider-list';
import logger from '../../logger/logger';
import EpisodeComperator from '../comperators/episode-comperator';

export default class EpisodeGeneratorHelper {
    /**
     * This converts a episode number to a list of episodes.
     * @param provider
     * @param season
     */
    public static generateMissingEpisodes(provider: ProviderLocalData, season?: Season): Episode[] {
        const episodeSeason: undefined | Season = this.getEpisodeSeason(provider, season);
        if (this.canGenerateMissingEpisodes(provider)) {
            const numberOfMissingEpisodes = this.getNumberOfMissingEpisodes(provider);
            return this.generateAllEpisodes(provider, episodeSeason, 1, numberOfMissingEpisodes);
        }
        return [];
    }

    private static generateAllEpisodes(provider: ProviderLocalData, episodeSeason?: Season, startEpisode = 1, numberOfEpiodes = 0) {
        const generatedEpisodes: Episode[] = [];
        for (let episodeNumber = startEpisode; episodeNumber <= numberOfEpiodes; episodeNumber++) {
            const isEpisodePresent = this.isEpisodePresent(episodeNumber, provider, episodeSeason);
            if (!isEpisodePresent) {
                generatedEpisodes.push(this.generateSingleEpisode(episodeNumber, provider));
            }
        }
        return generatedEpisodes;
    }

    private static canGenerateMissingEpisodes(provider: ProviderLocalData): boolean {
        if (provider.episodes) {
            const numberOfMissingEpisodes = this.getNumberOfMissingEpisodes(provider);
            if (numberOfMissingEpisodes !== 0) {
                return true;
            }
        }
        return false;
    }

    private static getNumberOfMissingEpisodes(provider: ProviderLocalData): number {
        if (provider.episodes) {
            return provider.episodes - provider.getDetailedEpisodeLength();
        }
        return 0;
    }

    private static isEpisodePresent(episodeNumber: number, provider: ProviderLocalData, episodeSeason: Season | undefined) {
        let episodeFounded = false;
        for (const detailedEpisode of provider.detailEpisodeInfo) {
            if (EpisodeComperator.isEpisodeSameAsDetailedEpisode(episodeNumber, detailedEpisode, episodeSeason)) {
                episodeFounded = true;
                break;
            }
        }
        return episodeFounded;
    }

    /**
     * Episode season is only needed when provider dont have a unique id (multi seasons under same id)
     */
    private static getEpisodeSeason(provider: ProviderLocalData, season?: Season) {
        try {
            if (!ProviderList.getProviderInstanceByLocalData(provider).hasUniqueIdForSeasons) {
                return season;
            }
        } catch (err) {
            logger.debug(err);
        }
    }

    private static generateSingleEpisode(episodeNumber: number, provider: ProviderLocalData) {
        const episode = new Episode(episodeNumber);
        episode.provider = provider.provider;
        episode.providerId = provider.id;
        episode.type = EpisodeType.REGULAR_EPISODE;
        return episode;
    }
}
