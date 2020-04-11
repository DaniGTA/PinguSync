import ProviderLocalData from '../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import ExternalProvider from './external-provider';
import MultiProviderResult from './multi-provider-result';

export default abstract class ExternalMappingProvider extends ExternalProvider {
    public requireInternetAccessForGetMappings = true;

    public abstract getMappings(provider: ProviderLocalData): Promise<MultiProviderResult>;
}
