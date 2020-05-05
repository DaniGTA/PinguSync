import ExternalInformationProvider from '../../../api/provider/external-information-provider';
import ExternalMappingProvider from '../../../api/provider/external-mapping-provider';
import ExternalProvider from '../../../api/provider/external-provider';
import InfoProvider from '../../../api/provider/info-provider';
import ListProvider from '../../../api/provider/list-provider';
import ProviderLocalDataWithSeasonInfo from '../../../helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
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
     * Get all External Providers that can Support
     */
    public static getMappingProviderList(): ExternalMappingProvider[] {
        if (!this.loadedMappingProvider) {
            this.loadedMappingProvider = this.loadMappingProviderList();
            return this.loadedMappingProvider;
        } else {
            return this.loadedMappingProvider;
        }
    }

    /**
     * Get all External Providers that have a supported api.
     */
    public static getAllProviderLists(): ExternalProvider[] {
        return [
            ...this.getInfoProviderList(),
            ...this.getListProviderList(),
            ...this.getMappingProviderList(),
        ];
    }

    public static getAllExternalInformationProvider(): ExternalInformationProvider[] {
        return [...this.getInfoProviderList(), ...this.getListProviderList()];
    }

    /**
     * Get the current static instance of the api.
     * @param localdata
     */
    public static getProviderInstanceByLocalData(localdata: ProviderLocalData | ProviderLocalDataWithSeasonInfo): ExternalInformationProvider {
        let providerName = '';
        if (localdata instanceof ProviderLocalDataWithSeasonInfo) {
            providerName = localdata.providerLocalData.provider;
        } else {
            providerName = localdata.provider;
        }
        const result = this.getProviderInstanceByProviderName(providerName);
        if (result !== undefined) {
            return result;
        }
        throw new Error('[ProviderList] NoProviderFound: ' + providerName);
    }

    public static getProviderInstanceByProviderName(providerName: string): ExternalInformationProvider | undefined {
        for (const provider of ProviderList.getAllExternalInformationProvider()) {
            if (provider.providerName === providerName) {
                return provider;
            }
        }
    }

    /**
     * Get the provider name from a mapped list.
     * @param providerClass class object.
     */
    public static getProviderNameByClass(providerClass: (new () => ExternalProvider)): string {
        if (!this.loadedInfoProvider || !this.loadedListProvider || !this.loadedMappingProvider) {
            this.getAllProviderLists();
        }
        const result = this.providerNameList.get(providerClass);
        if (result !== undefined) {
            return result;
        }
        throw new
            Error('Failed to get provider name by class for provider: ' + providerClass.name);
    }

    /**
     * Get a active instance from the loaded list with the class object.
     * @param providerClass class object.
     */
    public static getProviderInstanceByClass<T extends ExternalProvider>(providerClass: (new () => T)): T {
        const providerName = this.getProviderNameByClass(providerClass);
        for (const providerInstance of this.getAllProviderLists()) {
            if (providerInstance.providerName === providerName) {
                return providerInstance as T;
            }
        }
        throw new Error('Failed to get provider instance by class for provider: ' + providerClass.name + ' (' + providerName + ')');
    }
}
