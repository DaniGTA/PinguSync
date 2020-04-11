import Episode from '../../../controller/objects/meta/episode/episode';
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';

export default class EpisodeProviderBind {
    public readonly episode: Episode;
    public readonly provider: ProviderLocalData;
    constructor(episode: Episode, provider: ProviderLocalData) {
        this.episode = episode;
        this.provider = provider;
    }
}
