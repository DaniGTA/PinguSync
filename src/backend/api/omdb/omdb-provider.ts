// tslint:disable-next-line: no-implicit-dependencies
import request from 'request';
import { InfoProviderLocalData } from '../../controller/provider-manager/local-data/info-provider-local-data';
import { MediaType } from '../../controller/objects/meta/media-type';
import Series from '../../controller/objects/series';
import logger from '../../logger/logger';
import InfoProvider from '../provider/info-provider';
import MultiProviderResult from '../provider/multi-provider-result';
import { IdRequestResult } from './models/id-request-result';
import { SearchResults } from './models/search-results';
import OMDbConverter from './omdb-converter';
export default class OMDbProvider extends InfoProvider {
    public static instance: OMDbProvider;
    public isOffline: boolean = false;
    public hasOAuthCode: boolean = false;
    public providerName: string = 'omdb';
    public hasUniqueIdForSeasons: boolean = false;
    public supportedMediaTypes: MediaType[] = [MediaType.MOVIE, MediaType.SERIES];
    public version: number = 1;
    public apikey = '728e1e03';
    constructor() {
        super();
        if (!OMDbProvider.instance) {
            OMDbProvider.instance = this;
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
        const results: MultiProviderResult[] = [];
        const converter = new OMDbConverter();
        try {
            const result = await this.webRequest<SearchResults>('https://www.omdbapi.com/?apikey=' + this.apikey + '&s=' + encodeURI(searchTitle));
            if (result.Search) {
                for (const resultEntry of result.Search) {
                    results.push(converter.convertSearchResult(resultEntry));
                }
            }

        } catch (err) {
            logger.log('info', err);
        }
        return results;
    }
    public async getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult> {
        const converter = new OMDbConverter();
        const result = await this.webRequest<IdRequestResult>('https://www.omdbapi.com/?apikey=' + this.apikey + '&i=' + provider.id);
        return converter.convertIdRequest(result);
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
