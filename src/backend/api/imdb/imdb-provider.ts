// tslint:disable-next-line: no-implicit-dependencies
import request from 'request';
import { MediaType } from '../../controller/objects/meta/media-type';
import Series from '../../controller/objects/series';
import { InfoProviderLocalData } from '../../controller/provider-manager/local-data/info-provider-local-data';
import logger from '../../logger/logger';

import MultiProviderResult from '../provider/multi-provider-result';
import InfoProvider from '../provider/info-provider';
import ExternalProvider from '../provider/external-provider';


export default class ImdbProvider implements InfoProvider {
    public static Instance: ImdbProvider;
    public isOffline: boolean = false;
    public hasOAuthCode: boolean = false;
    public providerName: string = 'imdb';
    public hasUniqueIdForSeasons: boolean = false;
    public supportedMediaTypes: MediaType[] = [MediaType.MOVIE];
    public supportedOtherProvider: Array<(new () => ExternalProvider)> = [];
    public version: number = 1;
    public apikey = '728e1e03';
    constructor() {
        if (!ImdbProvider.Instance) {
            ImdbProvider.Instance = this;
        }
    }

    public async getAllSeries(disableCache?: boolean | undefined): Promise<Series[]> {
        throw new Error('Method not implemented.');
    }
    public async logInUser(pass: string, username?: string | undefined): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    public isUserLoggedIn(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    public getTokenAuthUrl(): string {
        throw new Error('Method not implemented.');
    }

    public async isProviderAvailable(): Promise<boolean> {
        return true;
    }

    public async getMoreSeriesInfoByName(searchTitle: string, season?: number | undefined): Promise<MultiProviderResult[]> {
        throw new Error('Method not implemented.');
    }
    public async getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult> {
        throw new Error('Method not implemented.');
    }

    private async webRequest<T>(url: string, method = 'GET'): Promise<T> {
        return new Promise<any>((resolve, reject) => {
            (async () => {
                try {
                    request({
                        method,
                        url,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        timeout: 5000,
                    }, (error: any, response: any, body: any) => {
                        try {

                            if (response.statusCode === 200 || response.statusCode === 201) {
                                const data: T = JSON.parse(body) as T;
                                resolve(data);
                            } else {
                                logger.error('[OMDb] status code: ' + response.statusCode);
                                reject();
                            }
                        } catch (err) {
                            logger.error(err);
                            reject();
                        }
                    }).on('error', (err) => {
                        logger.error(err);
                        reject();
                    });
                } catch (err) {
                    logger.error(err);
                    reject();
                }
            })();
        });
    }
}
