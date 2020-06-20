import ProviderLocalData from '../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import ExternalProvider from './external-provider';
import MultiProviderResult from './multi-provider-result';
import EpisodeMapping from '../../controller/objects/meta/episode/episode-mapping';

export default abstract class ExternalMappingProvider extends ExternalProvider {
    public requireInternetAccessForGetMappings = true;

    public abstract getSeriesMappings(provider: ProviderLocalData): Promise<MultiProviderResult>;
    public abstract getEpisodeMappings(provider: ProviderLocalData): Promise<EpisodeMapping>
}
