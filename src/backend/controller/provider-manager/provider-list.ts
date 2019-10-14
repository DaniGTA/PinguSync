import IExternalProvider from '../../api/provider/external-provider';
import IInfoProvider from '../../api/provider/info-provider';
import IListProvider from '../../api/provider/list-provider';
import ProviderLocalData from './local-data/interfaces/provider-local-data';
import ProviderLoader from './provider-loader';

export default class ProviderList extends ProviderLoader {
    public static getListProviderList(): IListProvider[] {
        if (!this.loadedListProvider) {
            this.loadedListProvider = this.loadListProviderList();
            return this.loadedListProvider;
        } else {
            return this.loadedListProvider;
        }
    }

    public static getInfoProviderList(): IInfoProvider[] {
        if (!this.loadedInfoProvider) {
            this.loadedInfoProvider = this.loadInfoProviderList();
            return this.loadedInfoProvider;
        } else {
            return this.loadedInfoProvider;
        }
    }

    public static getExternalProviderInstance(localdata: ProviderLocalData): IExternalProvider {
        for (const provider of ProviderList.getListProviderList()) {
            if (provider.providerName === localdata.provider) {
                return provider;
            }
        }
        for (const provider of ProviderList.getInfoProviderList()) {
            if (provider.providerName === localdata.provider) {
                return provider;
            }
        }
        throw new Error('NoProviderFound');
    }

}
