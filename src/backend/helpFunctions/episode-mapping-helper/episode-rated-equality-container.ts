import ComperatorResult from '../comperators/comperator-results.ts/comperator-result';
import EpisodeProviderBind from './episode-provider-bind';

export default class EpisodeRatedEqualityContainer {
    public readonly result: ComperatorResult;
    public readonly episodeBinds: EpisodeProviderBind[];
    constructor(result: ComperatorResult, ...episodes: EpisodeProviderBind[]) {
        this.episodeBinds = episodes;
        this.result = result;
    }
}
