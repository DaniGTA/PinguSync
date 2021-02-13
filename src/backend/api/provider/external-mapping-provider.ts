import ProviderLocalData from '../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import ExternalProvider from './external-provider';
import MultiProviderResult from './multi-provider-result';
import EpisodeBindingPool from '../../controller/objects/meta/episode/episode-binding-pool';

export default abstract class ExternalMappingProvider extends ExternalProvider {
    public requireInternetAccessForGetMappings = true;

    /**
     * Get a Series Mapping by an external provider mostly pre defined sets.
     * @param provider the provider for that you want the mapping set.
     */
    public abstract getSeriesMappings(provider: ProviderLocalData): Promise<MultiProviderResult[]>;

    /**
     * Get a Episode Mapping by an external provider mostly pre defined sets.
     * @param provider the provider for that you want the mapping set.
     */
    public abstract getEpisodeMappings(provider: ProviderLocalData): Promise<EpisodeBindingPool[]>
}
