import ProviderLocalData from '../../controller/interfaces/provider-local-data';
import Episode from '../../controller/objects/meta/episode/episode';

export default class EpisodeProviderBind {
    public readonly episode: Episode;
    public readonly provider: ProviderLocalData;
    constructor(episode: Episode, provider: ProviderLocalData) {
        this.episode = episode;
        this.provider = provider;
    }
}
