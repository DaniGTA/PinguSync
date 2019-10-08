import ComperatorResult from '../comperators/comperator-results.ts/comperator-result';
import Episode from '../../controller/objects/meta/episode/episode';
import ProviderLocalData from '../../controller/interfaces/provider-local-data';
import EpisodeProviderBind from './episode-provider-bind';

export default class EpisodeRatedEqualityContainer {
    result: ComperatorResult;
    episodeBinds: EpisodeProviderBind[];
    constructor(result: ComperatorResult, ...episodes: EpisodeProviderBind[]) {
        this.episodeBinds = episodes;
        this.result = result;
    }
}
