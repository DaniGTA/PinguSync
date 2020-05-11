import { FailedRequestError } from '../../../controller/objects/meta/failed-request';

export default class DownloadSettings {
    public static readonly REQUEST_TIMEOUT_IN_MS: number = 12500;
    public static readonly MAX_RETRYS_FOR_NAME_SEARCH: number = 5;

    public static async requestTimoutPromise<T>(): Promise<T> {
        return new Promise<T>((resolve, reject) => setTimeout(() => {
            reject(FailedRequestError.Timeout);
        }, DownloadSettings.REQUEST_TIMEOUT_IN_MS));
    }
}
