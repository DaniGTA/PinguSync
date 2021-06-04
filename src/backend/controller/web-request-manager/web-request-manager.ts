/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import logger from '../../../../src/backend/logger/logger'
import got from 'got'
import RequestBundle from './request-bundle'
/**
 * The web request manager handels all request that goes from this application to the web.
 * This make tests easier and can reduce multiple requests.
 */
export default class WebRequestManager {
    // eslint-disable-next-line @typescript-eslint/ban-types
    public static async request<T extends object | string>(
        requestOptions: RequestBundle
    ): Promise<got.Response<any | T>> {
        logger.debug(`Request on BaseURL: ${requestOptions.url.toString() ?? ''}`)
        return await got(requestOptions.url, requestOptions.options)
    }
}
