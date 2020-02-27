import ExternalProvider from '../../api/provider/external-provider';
import InfoProvider from '../../api/provider/info-provider';
import ListProvider from '../../api/provider/list-provider';
import ProviderLocalDataWithSeasonInfo from '../../helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import ProviderLocalData from './local-data/interfaces/provider-local-data';
import ProviderLoader from './provider-loader';

export default class ProviderList extends ProviderLoader {
    /**
     * Get all External Providers that can Support a List api.
     */
    public static getListProviderList(): ListProvider[] {
        if (!this.loadedListProvider) {
            this.loadedListProvider = this.loadListProviderList();
            return this.loadedListProvider;
        } else {
            return this.loadedListProvider;
        }
    }

    /**
     * Get all External Providers that can Support only Information
     */
    public static getInfoProviderList(): InfoProvider[] {
        if (!this.loadedInfoProvider) {
            this.loadedInfoProvider = this.loadInfoProviderList();
            return this.loadedInfoProvider;
        } else {
            return this.loadedInfoProvider;
        }
    }
    /**
     * Get all External Providers that have a supported api.
     */
    public static getAllProviderLists(): ExternalProvider[] {
        return [...this.getInfoProviderList(), ...this.getListProviderList()];
    }

    /**
     * Get the current static instance of the api.
     * @param localdata
     */
    public static getExternalProviderInstance(localdata: ProviderLocalData | ProviderLocalDataWithSeasonInfo): ExternalProvider {
        let providerName = '';
        if (localdata instanceof ProviderLocalDataWithSeasonInfo) {
            providerName = localdata.providerLocalData.provider;
        } else {
            providerName = localdata.provider;
        }
        for (const provider of ProviderList.getListProviderList()) {
            if (provider.providerName === providerName) {
                return provider;
            }
        }
        for (const provider of ProviderList.getInfoProviderList()) {
            if (provider.providerName === providerName) {
                return provider;
            }
        }
        throw new Error('[ProviderList] NoProviderFound: ' + providerName);
    }

}
