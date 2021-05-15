import ExternalInformationProvider from '../../../api/provider/external-information-provider'
import MultiProviderResult from '../../../api/provider/multi-provider-result'
import { FailedRequestError, isFailedRequestError } from '../../../controller/objects/meta/failed-request'
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data'
import DownloadSettings from './download-settings'
import logger from '../../../logger/logger'

export default class DownloadProviderLocalDataWithId {
    public static async download(
        provider: ExternalInformationProvider,
        providerLocalData: ProviderLocalData
    ): Promise<MultiProviderResult> {
        if (provider.requireInternetAccessForGetFullById) {
            await provider.waitUntilItCanPerfomNextRequest()
        }
        try {
            const timeoutId = DownloadSettings.getTimeoutId()
            const result = await Promise.race([
                DownloadSettings.requestTimoutPromise<MultiProviderResult>(timeoutId),
                provider.getFullInfoById(providerLocalData),
            ])
            DownloadSettings.stopTimeout(timeoutId)
            return result
        } catch (err) {
            if (isFailedRequestError(err)) {
                throw err
            }
            logger.error(err + ' | ' + provider.providerName)
            throw FailedRequestError.ProviderNoResult
        }
    }
}
