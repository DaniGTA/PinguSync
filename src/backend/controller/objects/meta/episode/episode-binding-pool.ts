import Episode from './episode';
import EpisodeMapping from './episode-mapping';
import EpisodeComperator from '../../../../helpFunctions/comperators/episode-comperator';

export default class EpisodeBindingPool {
    public readonly bindedEpisodes: EpisodeMapping[] = [];

    constructor(episodes: EpisodeMapping[]) {
        this.bindedEpisodes = episodes;
    }

    addEpisodeMappingToBindings(...episodeMappings: EpisodeMapping[]) {
        this.bindedEpisodes.push(...episodeMappings);
    }

    bindingPoolHasEpisodeMapping(episodeMapping: EpisodeMapping): boolean {
        for (const episode of this.bindedEpisodes) {
            if (EpisodeComperator.compareEpisodeMapping(episode, episodeMapping)) {
                return true;
            }
        }
        return false;
    }
}
