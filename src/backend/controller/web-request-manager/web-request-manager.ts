/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import logger from '../../../../src/backend/logger/logger'
import got from 'got'
import RequestBundle from './request-bundle'
import stream from 'stream'
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
        const result = await got(requestOptions.url, requestOptions.options)
        logger.debug(`Request Status Code: ${result.statusCode}`)
        return result
    }

    public static stream(url: string): got.GotEmitter & stream.Duplex {
        logger.debug(`Open download stream on BaseURL: ${url}`)
        return got.stream(url)
    }
}
