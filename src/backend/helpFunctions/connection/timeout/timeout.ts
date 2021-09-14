import { FailedRequestError } from '../../../controller/objects/meta/failed-request'
import logger from '../../../logger/logger'
import DownloadSettings from '../../provider/provider-info-downloader/download-settings'

export default class Timeout {
    private onTimeoutList: (() => void)[] = []
    private timeoutFinished = false
    private timeoutCanceled = false
    private timeoutInstance: NodeJS.Timeout

    constructor(timeout: number = DownloadSettings.REQUEST_TIMEOUT_IN_MS) {
        this.timeoutInstance = setTimeout(() => {
            logger.debug(`Request Timeout (Limit: ${DownloadSettings.REQUEST_TIMEOUT_IN_MS})`)
            this.timeoutFinished = true
            this.fireTimeout()
        }, timeout)
    }

    onTimeout(x: () => void): void {
        this.onTimeoutList.push(x)
    }

    onTimeoutPromise<T>(): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (this.timeoutFinished) {
                if (this.timeoutCanceled) {
                    resolve({} as T)
                } else {
                    reject(FailedRequestError.Timeout)
                }
            } else {
                this.onTimeout(() => {
                    if (this.timeoutCanceled) {
                        resolve({} as T)
                    } else {
                        reject(FailedRequestError.Timeout)
                    }
                })
            }
        })
    }

    public cancel(): void {
        this.timeoutCanceled = true
        this.timeoutFinished = true
        clearTimeout(this.timeoutInstance)
        this.fireTimeout()
    }

    private fireTimeout(): void {
        for (const timeout of this.onTimeoutList) {
            try {
                timeout()
            } catch (err) {
                logger.error(err)
            }
        }
        this.onTimeoutList = []
    }
}
