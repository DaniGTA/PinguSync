import { FailedRequestError } from '../../../controller/objects/meta/failed-request'
import logger from '../../../logger/logger'
import StringHelper from '../../string-helper'

export default class DownloadSettings {
    public static readonly REQUEST_TIMEOUT_IN_MS: number = 12500
    public static readonly MAX_RETRYS_FOR_NAME_SEARCH: number = 5

    private static currentRunningTimeouts: Map<string, NodeJS.Timeout> = new Map<string, NodeJS.Timeout>()

    public static getTimeoutId(): string {
        return StringHelper.randomString(35)
    }

    public static async requestTimoutPromise<T>(id: string): Promise<T> {
        return new Promise<T>((resolve, reject) =>
            this.currentRunningTimeouts.set(
                id,
                setTimeout(() => {
                    logger.debug(`Request Timeout (Limit: ${DownloadSettings.REQUEST_TIMEOUT_IN_MS})`)
                    this.currentRunningTimeouts.delete(id)
                    reject(FailedRequestError.Timeout)
                }, DownloadSettings.REQUEST_TIMEOUT_IN_MS)
            )
        )
    }

    public static stopTimeout(id: string): void {
        const timeout = this.currentRunningTimeouts.get(id)
        if (timeout) {
            clearTimeout(timeout)
            this.currentRunningTimeouts.delete(id)
        }
    }
}
