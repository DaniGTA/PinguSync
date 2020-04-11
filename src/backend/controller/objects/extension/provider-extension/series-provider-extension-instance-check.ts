import { InfoProviderLocalData } from '../../../provider-controller/provider-manager/local-data/info-provider-local-data';
import ProviderLocalData from '../../../provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import { ListProviderLocalData } from '../../../provider-controller/provider-manager/local-data/list-provider-local-data';


export default class SeriesProviderExtensionInstanceCheck {
    public static instanceOfInfoProviderLocalData(pld: ProviderLocalData) {
        if (pld instanceof InfoProviderLocalData || pld.instanceName === 'InfoProviderLocalData') {
            return true;
        }
        return false;
    }

    public static instanceOfListProviderLocalData(pld: ProviderLocalData) {
        if (pld instanceof ListProviderLocalData || pld.instanceName === 'ListProviderLocalData') {
            return true;
        }
        return false;
    }
}
