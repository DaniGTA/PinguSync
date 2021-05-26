import ExternalInformationProvider from '../../../api/provider/external-information-provider'
import MultiProviderResult from '../../../api/provider/multi-provider-result'
import { FailedRequestError, isFailedRequestError } from '../../../controller/objects/meta/failed-request'
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data'
import logger from '../../../logger/logger'
import Timeout from '../../connection/timeout/timeout'

export default class DownloadProviderLocalDataWithId {
    public static async download(
        provider: ExternalInformationProvider,
        providerLocalData: ProviderLocalData
    ): Promise<MultiProviderResult> {
        if (provider.requireInternetAccessForGetFullById) {
            await provider.waitUntilItCanPerfomNextRequest()
        }
        const timeout = new Timeout()
        try {
            const result = await Promise.race([
                timeout.onTimeoutPromise<MultiProviderResult>(),
                provider.getFullInfoById(providerLocalData),
            ])
            timeout.cancel()
            return result
        } catch (err) {
            timeout.cancel()
            if (isFailedRequestError(err)) {
                throw err
            }
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            logger.error(`${err} | ${provider.providerName}`)
            throw FailedRequestError.ProviderNoResult
        }
    }
}
