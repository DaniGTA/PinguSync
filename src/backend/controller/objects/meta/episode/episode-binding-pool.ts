import EpisodeComperator from '../../../../helpFunctions/comperators/episode-comperator';
import Episode from './episode';
import EpisodeMapping from './episode-mapping';

export default class EpisodeBindingPool {
    public readonly bindedEpisodeMappings: EpisodeMapping[] = [];

    constructor(...episodes: EpisodeMapping[]) {

        this.bindedEpisodeMappings.push(...episodes);
    }
    /**
     * Checks if episodeMapping already exists in pool.
     * @param episodeMappings
     */
    public addEpisodeMappingToBindings(...episodeMappings: EpisodeMapping[]) {
        for (const episodeMapping of episodeMappings) {
            if (this.isBindingpoolHaveThisProvider(episodeMapping.provider)) {
                continue;
            }
            let found = false;
            for (const currentEpisodeMapping of this.bindedEpisodeMappings) {
                if (EpisodeComperator.compareEpisodeMapping(episodeMapping, currentEpisodeMapping)) {
                    found = true;
                    continue;
                }
            }
            if (!found) {
                this.bindedEpisodeMappings.push(episodeMapping);
            }
        }
    }

    public bindingPoolHasEpisodeMapping(episodeMapping: EpisodeMapping): boolean {
        for (const episode of this.bindedEpisodeMappings) {
            if (EpisodeComperator.compareEpisodeMapping(episode, episodeMapping)) {
                return true;
            }
        }
        return false;
    }

    public isBindingpoolHaveThisProvider(provider: string): boolean {
        return this.bindedEpisodeMappings.findIndex((x) => x.provider === provider) !== -1;
    }

    public bindingPoolHasEpisode(episode: Episode): boolean {
        for (const bindedEpisode of this.bindedEpisodeMappings) {
            if (EpisodeComperator.compareEpisodeMappingToEpisode(bindedEpisode, episode)) {
                return true;
            }
        }
        return false;
    }
}
