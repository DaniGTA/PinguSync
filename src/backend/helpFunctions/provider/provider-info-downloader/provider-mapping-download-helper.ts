import MultiProviderResult from '../../../api/provider/multi-provider-result';
import Series from '../../../controller/objects/series';
import ExternalMappingProvider from '../../../api/provider/external-mapping-provider';
import ExternalProvider from '../../../api/provider/external-provider';
import ExternalInformationProvider from '../../../api/provider/external-information-provider';
import ProviderList from '../../../controller/provider-manager/provider-list';

export default class ProviderMappingDownloadHelper {
    public static async getMappingForSeries(series: Series): Promise<MultiProviderResult[]> {
        const allLocalDatas = series.getAllProviderLocalDatas();
        for (const localData of allLocalDatas) {
            const providerInstance = ProviderList.getExternalProviderInstance(localData);
            const relevantMappingProviders = this.getAllAvailableMappingProviderThatSupportProvider(providerInstance);
        }
    }

    /**
     * Get all mapping provider that support given external information provider.
     * @param provider provider instance.
     */
    private static getAllAvailableMappingProviderThatSupportProvider(provider: ExternalInformationProvider): ExternalMappingProvider[] {
        const allMappingProvidersThatSupportGivenProvider: ExternalMappingProvider[] = [];
        const allMappingProviders = ProviderList.getMappingProviderList();
        for (const mappingProvider of allMappingProviders) {
            for (const supportedProvider of mappingProvider.supportedOtherProvider) {
                const supportProviderName = ProviderList.getProviderNameByClass(supportedProvider);
                if (supportProviderName === provider.providerName) {
                    allMappingProvidersThatSupportGivenProvider.push(mappingProvider);
                }
            }
        }
        return allMappingProvidersThatSupportGivenProvider;
    }
}
