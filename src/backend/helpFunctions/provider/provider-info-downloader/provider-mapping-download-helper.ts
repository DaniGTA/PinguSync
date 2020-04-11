import ExternalInformationProvider from '../../../api/provider/external-information-provider';
import ExternalMappingProvider from '../../../api/provider/external-mapping-provider';
import MultiProviderResult from '../../../api/provider/multi-provider-result';
import Series from '../../../controller/objects/series';
import ProviderList from '../../../controller/provider-controller/provider-manager/provider-list';
import logger from '../../../logger/logger';

export default class ProviderMappingDownloadHelper {
    public static async getMappingForSeries(series: Series): Promise<MultiProviderResult[]> {
        const result = [];
        const allLocalDatas = series.getAllProviderLocalDatas();
        for (const localData of allLocalDatas) {
            try {
                const providerInstance = ProviderList.getProviderInstanceByLocalData(localData);
                const relevantMappingProviders = this.getAllAvailableMappingProviderThatSupportProvider(providerInstance);
                for (const mappingProvider of relevantMappingProviders) {
                    try {
                        result.push(await mappingProvider.getMappings(localData));
                    } catch (err) {
                        logger.error(err);
                    }
                }
            } catch (err) {
                logger.debug(err);
            }
        }
        return result;
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
