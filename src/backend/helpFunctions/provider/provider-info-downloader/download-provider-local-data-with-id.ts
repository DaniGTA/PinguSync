import ExternalInformationProvider from '../../../api/provider/external-information-provider';
import MultiProviderResult from '../../../api/provider/multi-provider-result';
import { FailedRequestError } from '../../../controller/objects/meta/failed-request';
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import DownloadSettings from './download-settings';

export default class DownloadProviderLocalDataWithId {
    public static async download(provider: ExternalInformationProvider, providerLocalData: ProviderLocalData): Promise<MultiProviderResult> {
        if (provider.requireInternetAccessForGetFullById) {
            await provider.waitUntilItCanPerfomNextRequest();
        }
        try {
            return await Promise.race(
                [
                    DownloadSettings.requestTimoutPromise<MultiProviderResult>(),
                    provider.getFullInfoById(providerLocalData),
                ]);
        } catch (err) {
            if (!isNaN(err)) {
                throw err;
            }
            console.error(err);
            throw FailedRequestError.ProviderNoResult;
        }
    }
}

