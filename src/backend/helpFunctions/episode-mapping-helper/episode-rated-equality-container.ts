import ComperatorResult from '../comperators/comperator-results.ts/comperator-result';
import Episode from '../../controller/objects/meta/episode/episode';

export default class EpisodeRatedEqualityContainer{
    result: ComperatorResult;
    episode: Episode;
    constructor(result:ComperatorResult, episode:Episode) {
        this.episode = episode;
        this.result = result;
    }
}