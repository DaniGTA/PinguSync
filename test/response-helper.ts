import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import request from 'request';
import logger from '../src/backend/logger/logger';
export default class ResponseHelper {

    public static async mockRequest(options: (request.UriOptions & request.CoreOptions)): Promise<request.Response> {
        const requestId = ResponseHelper.generateRequestId(options);
        if (ResponseHelper.isRequestCached(requestId)) {
            return ResponseHelper.loadCache(requestId);
        } else {
            logger.info('[MocketRequest] Request is not cached and will be performed. Make sure you have all needed api keys.');
            // tslint:disable-next-line: max-line-length
            logger.info('[MocketRequest] If you added the api keys after the request pls deleted ' + requestId + '.json in the folder: ' + ResponseHelper.cacheFolderName);
            return new Promise<request.Response>((resolve, rejects) => {
                try {
                    request(options, (errormsg: any, response: request.Response, body: any) => {
                        ResponseHelper.cacheNewRequest(response, requestId);
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
    private static cacheFolderName = './test-web-response-cache/';

    private static generateRequestId(options: (request.UriOptions & request.CoreOptions)): string {
        // reset headers
        const copy = { ...options };
        copy.headers = {};

        const text = JSON.stringify(copy);
        return createHash('sha256').update(text).digest('hex');
    }

    private static isRequestCached(id: string): boolean {
        return existsSync(this.cacheFolderName + id + '.json');
    }

    private static cacheNewRequest(response: request.Response, id: string): void {
        if (response !== undefined) {
            response.headers = {};
            response.request.headers = {};
            const fileContent = JSON.stringify(response);
            try {
                statSync(this.cacheFolderName);
            } catch (e) {
                mkdirSync(this.cacheFolderName);
            }
            writeFileSync(this.cacheFolderName + id + '.json', fileContent);
        }
    }

    private static loadCache(id: string): request.Response {
        return JSON.parse(readFileSync(this.cacheFolderName + id + '.json', 'UTF-8')) as unknown as request.Response ;
    }
}
