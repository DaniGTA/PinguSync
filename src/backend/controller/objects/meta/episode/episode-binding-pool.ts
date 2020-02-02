import EpisodeComperator from '../../../../helpFunctions/comperators/episode-comperator';
import Episode from './episode';
import EpisodeMapping from './episode-mapping';

export default class EpisodeBindingPool {
    public readonly bindedEpisodeMappings: EpisodeMapping[] = [];

    constructor(...episodes: EpisodeMapping[]) {
        this.bindedEpisodeMappings.push(...episodes);
    }

    public addEpisodeMappingToBindings(...episodeMappings: EpisodeMapping[]) {
        this.bindedEpisodeMappings.push(...episodeMappings);
    }

    public bindingPoolHasEpisodeMapping(episodeMapping: EpisodeMapping): boolean {
        for (const episode of this.bindedEpisodeMappings) {
            if (EpisodeComperator.compareEpisodeMapping(episode, episodeMapping)) {
                return true;
            }
        }
        return false;
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
