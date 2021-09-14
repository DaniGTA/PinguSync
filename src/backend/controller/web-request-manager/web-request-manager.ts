import got from 'got'
import logger from '@/backend/logger/logger'
import RequestBundle from './request-bundle'
/**
 * The web request manager handels all request that goes from this application to the web.
 * This make tests easier and can reduce multiple requests.
 */
export default class WebRequestManager {
    // eslint-disable-next-line @typescript-eslint/ban-types
    public static async request<T extends object | string>(requestOptions: RequestBundle) {
        logger.debug(`Request on BaseURL: ${requestOptions.url.toString() ?? ''}`)
        const result = await got<T>(requestOptions.url, requestOptions.options)
        logger.debug(`Request Status Code: ${result.statusCode}`)
        return result
    }

    public static stream(url: string) {
        logger.debug(`Open download stream on BaseURL: ${url}`)
        return got.stream(url)
    }
}
