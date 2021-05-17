/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createHash } from 'crypto'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'fs'
import request from 'request'
import WebRequestManager from '../src/backend/controller/web-request-manager/web-request-manager'
import logger from '../src/backend/logger/logger'

export default class ResponseHelper {
    private static cacheFolderName = './test-web-response-cache/'

    public static mockRequest(): void {
        jest.mock('../src/backend/controller/web-request-manager/web-request-manager')

        const cachedRequest = async (options: request.UriOptions & request.CoreOptions): Promise<any> => {
            const requestId = createHash('sha256')
                .update(JSON.stringify(options))
                .digest('hex')
            logger.info('[RequestMocker] Request cached id:' + requestId)

            if (ResponseHelper.isRequestCached(requestId)) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return this.loadCache(requestId)
            } else {
                return new Promise<request.Response>((resolve, rejects) => {
                    try {
                        request(options, (errormsg: any, response: request.Response, body: any) => {
                            this.cacheNewRequest(response, requestId)

                            resolve(response)
                        }).on('error', err => {
                            logger.error(err)
                            rejects()
                        })
                    } catch (err) {
                        logger.error(err)
                        rejects()
                    }
                })
            }
        }
        WebRequestManager.request = jest.fn().mockImplementation(cachedRequest)
    }

    private static isRequestCached(id: string): boolean {
        return existsSync(this.cacheFolderName + id + '.json')
    }

    private static cacheNewRequest(response: any, id: string): void {
        logger.info('[RequestMocker] create cache for id:' + id)

        if (response !== undefined) {
            try {
                const fileContent = JSON.stringify(response)
                try {
                    statSync(this.cacheFolderName)
                } catch (e) {
                    mkdirSync(this.cacheFolderName)
                }
                writeFileSync(this.cacheFolderName + id + '.json', fileContent)
            } catch (err) {
                logger.error(`Caching failed for id: ${id} failed`)
                logger.error(err)
            }
        }
    }

    private static loadCache(id: string): any {
        logger.info('[RequestMocker] load cache for id:' + id)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return JSON.parse(readFileSync(this.cacheFolderName + id + '.json', { encoding: 'utf8' }))
    }
}
