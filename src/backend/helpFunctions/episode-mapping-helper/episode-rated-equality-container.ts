import ComperatorResult from '../comperators/comperator-results.ts/comperator-result';
import Episode from '../../controller/objects/meta/episode/episode';
import ProviderLocalData from '../../controller/interfaces/provider-local-data';

export default class EpisodeRatedEqualityContainer {
    result: ComperatorResult;
    episodeA: Episode;
    episodeB: Episode;
    providerA?: ProviderLocalData;
    providerB?: ProviderLocalData;
    constructor(result: ComperatorResult, episodeA: Episode, episodeB: Episode) {
        this.episodeA = episodeA;
        this.episodeB = episodeB;
        this.result = result;
    }
}
