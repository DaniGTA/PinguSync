
import EpisodeMapping from '../../../controller/objects/meta/episode/episode-mapping';
import ComperatorResult from '../../comperators/comperator-results.ts/comperator-result';
import EpisodeProviderBind from './episode-provider-bind';

export default class EpisodeRatedEqualityContainer {
    public readonly result: ComperatorResult;
    public readonly episodeBinds: EpisodeProviderBind[];
    constructor(result: ComperatorResult, ...episodes: EpisodeProviderBind[]) {
        this.episodeBinds = episodes;
        this.result = result;
    }

    public getEpisodeMappings(): EpisodeMapping[] {
        const tempList = [];
        for (const episodeBind of this.episodeBinds) {
            tempList.push(new EpisodeMapping(episodeBind.episode, episodeBind.provider));
        }
        return tempList;
    }
}
