import { MediaType } from '../../controller/objects/meta/media-type';
import WatchProgress from '../../controller/objects/meta/watch-progress';
import MultiProviderResult from '../multi-provider-result';
import Series from '../../controller/objects/series';
import { ListProviderLocalData } from '../../controller/objects/list-provider-local-data';
import IInfoProvider from '../info-provider';
import request from 'request';
import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import { SearchResults } from './models/search-results';
import OMDbConverter from './omdb-converter';
import { IdRequestResult } from './models/id-request-result';

export default class OMDbProvider implements IInfoProvider {
    isOffline: boolean = false;
    hasOAuthCode: boolean = false;
    public providerName: string = "omdb";
    hasUniqueIdForSeasons: boolean = false;
    supportedMediaTypes: MediaType[] = [MediaType.MOVIE, MediaType.SERIES];
    version: number = 1;
    apikey = "728e1e03";
    public static instance: OMDbProvider;
    constructor() {
        if (!OMDbProvider.instance) {
            OMDbProvider.instance = this;
        }
    }

    async getAllSeries(disableCache?: boolean | undefined): Promise<import("../../controller/objects/series").default[]> {
        throw new Error("Method not implemented.");
    }
    async logInUser(pass: string, username?: string | undefined): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    isUserLoggedIn(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    getTokenAuthUrl(): string {
        throw new Error("Method not implemented.");
    }

    async isProviderAvailable(): Promise<boolean> {
        return true;
    }

    async getMoreSeriesInfoByName(searchTitle: string, season?: number | undefined): Promise<MultiProviderResult[]> {
        const results: MultiProviderResult[] = [];
        const converter = new OMDbConverter();
        try {
            const result = await this.webRequest<SearchResults>('https://www.omdbapi.com/?apikey=' + this.apikey + "&s=" + encodeURI(searchTitle));
            if (result.Search) {
                for (const resultEntry of result.Search) {
                    results.push(converter.convertSearchResult(resultEntry));
                }
            }

        } catch (err) {
            console.log(err);
        }
        return results;
    }
    async getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult> {
        const converter = new OMDbConverter();
        const result = await this.webRequest<IdRequestResult>('https://www.omdbapi.com/?apikey=' + this.apikey + "&i=" + provider.id);
        return converter.convertIdRequest(result);
    }


    private async webRequest<T>(url: string, method = 'GET'): Promise<T> {
        return new Promise<any>((resolve, reject) => {
            (async () => {
                try {
                    request({
                        method: method,
                        url,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        timeout: 5000
                    }, (error: any, response: any, body: any) => {
                        try {

                            if (response.statusCode === 200 || response.statusCode === 201) {
                                var data: T = JSON.parse(body) as T;
                                resolve(data);
                            } else {
                                console.log('[OMDb] status code: ' + response.statusCode);
                                reject();
                            }
                        } catch (err) {
                            console.log(err);
                            reject();
                        }
                    }).on('error', (err) => {
                        console.log(err);
                        reject();
                    })
                } catch (err) {
                    console.log(err);
                    reject();
                }
            })();
        });
    }
}
