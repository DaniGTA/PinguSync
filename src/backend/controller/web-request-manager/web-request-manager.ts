import request from 'request';
import logger from '../../../../src/backend/logger/logger';

/**
 * The web request manager handels all request that goes from this application to the web.
 * This make tests easier and can reduce multiple requests.
 */
export default class WebRequestManager {
    public static async request(options: (request.UriOptions & request.CoreOptions)): Promise< request.Response> {
        return new Promise<request.Response>((resolve, rejects) => {
            try {
                request(options, (errormsg: any, response: request.Response, body: any) => {
                    resolve(response);
                }).on('error', (err) => {
                    logger.error(err);
                    rejects();
                });
            } catch (err) {
                logger.error(err);
                rejects();
            }
        });
    }
}
