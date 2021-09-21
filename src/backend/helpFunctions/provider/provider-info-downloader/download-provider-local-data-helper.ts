import ExternalInformationProvider from '../../../api/provider/external-information-provider'
import MultiProviderResult from '../../../api/provider/multi-provider-result'
import { FailedRequestError, isFailedRequestError } from '../../../controller/objects/meta/failed-request'
import Series from '../../../controller/objects/series'
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data'
import ProviderNameManager from '../../../controller/provider-controller/provider-manager/provider-name-manager'
import DownloadProviderLocalDataWithId from './download-provider-local-data-with-id'
import DownloadProviderLocalDataWithoutId from './download-provider-local-data-without-id'
/**
 * Controlls provider request, text search, search result rating, data updates
 */
export default class DownloadProviderLocalDataHelper {
    // ---------------------------------------------------------
    // ! These functions below have a big impact on this program !
    // ----------------------------------------------------------

    // tslint:disable-next-line: max-line-length
    public static async downloadProviderLocalData(
        series: Series,
        provider: ExternalInformationProvider
    ): Promise<MultiProviderResult> {
        if (await provider.isProviderAvailable()) {
            const allLocalProviders = series.getAllProviderLocalDatas()
            const providerLocalForIdRequest = this.getProviderLocalForIdRequest(provider, allLocalProviders)

            try {
                if (!providerLocalForIdRequest) {
                    return await new DownloadProviderLocalDataWithoutId(series, provider).download()
                } else {
                    return await DownloadProviderLocalDataWithId.download(provider, providerLocalForIdRequest)
                }
            } catch (err) {
                if (isFailedRequestError(err as string)) {
                    throw err
                }
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                throw new Error(`[${provider.providerName}] Unkown error: ${err}`)
            }
        }
        throw FailedRequestError.ProviderNotAvailble
    }

    private static getProviderLocalForIdRequest(
        targetProvider: ExternalInformationProvider,
        allCurrentProviders: ProviderLocalData[]
    ): ProviderLocalData | undefined {
        for (const currentProvider of allCurrentProviders) {
            if (currentProvider.provider === targetProvider.providerName) {
                return currentProvider
            }
        }

        for (const supportedProvider of targetProvider.supportedOtherProvider) {
            const providerName = ProviderNameManager.getProviderName(supportedProvider)
            for (const currentProvider of allCurrentProviders) {
                if (providerName === currentProvider.provider) {
                    return currentProvider
                }
            }
        }
    }
}
