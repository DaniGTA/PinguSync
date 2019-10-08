import Episode from '../../controller/objects/meta/episode/episode';
import ProviderLocalData from '../../controller/interfaces/provider-local-data';

export default class EpisodeProviderBind {
    episode: Episode;
    provider: ProviderLocalData;
    constructor(episode:Episode,provider:ProviderLocalData) {
        this.episode = episode;
        this.provider = provider;
    }
}