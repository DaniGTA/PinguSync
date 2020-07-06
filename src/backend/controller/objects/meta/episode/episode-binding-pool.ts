import EpisodeComperator from '../../../../helpFunctions/comperators/episode-comperator';
import Episode from './episode';
import EpisodeMapping from './episode-mapping';

export default class EpisodeBindingPool {
    public readonly bindedEpisodeMappings: EpisodeMapping[] = [];
    // tslint:disable-next-line: variable-name
    private readonly __className: string;

    constructor(...episodes: EpisodeMapping[]) {
        this.__className = this.constructor.name;
        this.bindedEpisodeMappings.push(...episodes);
    }

    public loadPrototypes(): void {
        for (let index = 0; index < this.bindedEpisodeMappings.length; index++) {
            Object.setPrototypeOf(this.bindedEpisodeMappings[index], EpisodeMapping.prototype);
            this.bindedEpisodeMappings[index].loadPrototypes();
        }
    }

    /**
     * Checks if episodeMapping already exists in pool.
     * @param episodeMappings
     */
    public addEpisodeMappingToBindings(...episodeMappings: EpisodeMapping[]): void {
        for (const episodeMapping of episodeMappings) {
            if (this.isBindingpoolHaveThisProvider(episodeMapping.provider)) {
                continue;
            }
            let found = false;
            for (const currentEpisodeMapping of this.bindedEpisodeMappings) {
                if (EpisodeComperator.isSameEpisodeMapping(episodeMapping, currentEpisodeMapping)) {
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
            if (EpisodeComperator.isSameEpisodeMapping(episode, episodeMapping)) {
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
            if (EpisodeComperator.isSameEpisodeMappingToEpisode(bindedEpisode, episode)) {
                return true;
            }
        }
        return false;
    }
}
