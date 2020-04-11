import ExternalProvider from '../../../api/provider/external-provider';
import ProviderList from './provider-list';

export default class ProviderNameManager {
    public static getProviderName<A extends ExternalProvider>(c: new () => A): string {
        return ProviderList.getProviderNameByClass(c);
    }

    public static getProviderVersion<A extends ExternalProvider>(c: new () => A): number {
        return ProviderList.getProviderInstanceByClass(c).version;
    }
}
