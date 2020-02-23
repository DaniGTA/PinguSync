import Episode from '../controller/objects/meta/episode/episode';
import EpisodeBindingPool from '../controller/objects/meta/episode/episode-binding-pool';
import EpisodeMapping from '../controller/objects/meta/episode/episode-mapping';
import EpisodeComperator from './comperators/episode-comperator';

export default class EpisodeBindingPoolHelper {
    /**
     * Search the right episode binding pool and returns all binded episode mappings (no self return!)
     * @param episodeBindingPools a bunch of pools that can contain the binding of the episode
     * @param episode the target episode
     */
    public static getAllBindedEpisodesOfEpisode(episodeBindingPools: EpisodeBindingPool[], episode: Episode): EpisodeMapping[] {
        const result = this.getEpisodeBindingPoolThatContainsTheEpisode(episodeBindingPools, episode);
        if (result) {
            return this.extractAllMappedEpiodesFromBindingPool(result, episode);
        } else {
            return [];
        }
    }

    public static getEpisodeBindingPoolThatContainsTheEpisode(episodeBindingPools: EpisodeBindingPool[], episode: Episode): EpisodeBindingPool | undefined {
        return episodeBindingPools.find((x) => x.bindingPoolHasEpisode(episode));
    }


    public static isEpisodeAlreadyBindedToAProvider(episodeBindingPools: EpisodeBindingPool[], episode: Episode, providerName: string): boolean {
        const allBindedEpisodes: EpisodeMapping[] = this.getAllBindedEpisodesOfEpisode(episodeBindingPools, episode);
        for (const bindedEpisode of allBindedEpisodes) {
            if (bindedEpisode.provider === providerName) {
                return true;
            }
        }
        return false;
    }

    private static extractAllMappedEpiodesFromBindingPool(episodeBindingPool: EpisodeBindingPool, episode: Episode) {
        const result: EpisodeMapping[] = [];
        for (const bindedEpisode of episodeBindingPool.bindedEpisodeMappings) {
            if (!EpisodeComperator.compareEpisodeMappingToEpisode(bindedEpisode, episode)) {
                result.push(bindedEpisode);
            }
        }
        return result;
    }
}
