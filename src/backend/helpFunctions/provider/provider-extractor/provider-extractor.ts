import ExternalInformationProvider from '../../../api/provider/external-information-provider';
import ExternalProvider from '../../../api/provider/external-provider';
import MultiProviderResult from '../../../api/provider/multi-provider-result';
import FailedProviderRequest from '../../../controller/objects/meta/failed-provider-request';
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import ProviderList from '../../../controller/provider-controller/provider-manager/provider-list';
import ProviderNameManager from '../../../controller/provider-controller/provider-manager/provider-name-manager';
import logger from '../../../logger/logger';
import listHelper from '../../list-helper';

export default class ProviderExtractor {
    public static extractTargetProviderFromMultiProviderResults(
        targetProvider: ExternalProvider, ...results: Array<MultiProviderResult | FailedProviderRequest>): MultiProviderResult | undefined {
        for (const multiProviderResults of results) {
            if (multiProviderResults instanceof MultiProviderResult) {
                const listOfAllProviders = [...multiProviderResults.getAllProviders()];
                const finalResult = this.extractTargetProviderFromProviderLocalDatas(targetProvider, listOfAllProviders);
                if (finalResult) {
                    return finalResult;
                }
            }
        }
    }


    /**
     * Get all providers that can give the id of the target provider.
     * @param targetProvider
     */
    public static extractProvidersThatCanProviderProviderId(targetProvider: ExternalInformationProvider): ExternalProvider[] {
        const providerThatProvidersId: ExternalInformationProvider[] = [];
        for (const provider of ProviderList.getAllProviderLists()) {
            if (provider.providerName !== targetProvider.providerName) {
                for (const supportProvider of provider.potentialSubProviders) {
                    try {
                        const providerName = ProviderNameManager.getProviderName(supportProvider);
                        if (providerName === targetProvider.providerName) {
                            const instance = ProviderList.getProviderInstanceByProviderName(provider.providerName);
                            if (instance) {
                                providerThatProvidersId.push(instance);
                                break;
                            }
                        }
                    } catch (err) {
                        logger.debug(err);
                    }
                }
            }
        }
        return providerThatProvidersId;
    }

    /**
     * The target provider will be moved to the main provider and all others will be assigned to the subProviderList
     * @param targetProvider
     * @param listOfAllProviders
     */
    private static extractTargetProviderFromProviderLocalDatas(
        targetProvider: ExternalProvider, listOfAllProviders: ProviderLocalData[]): MultiProviderResult | undefined {
        for (const provider of listOfAllProviders) {
            if (provider.provider === targetProvider.providerName) {
                const subProviderList = listHelper.removeEntrys(listOfAllProviders, provider);
                return new MultiProviderResult(provider, ...subProviderList);
            }
        }
    }
}
