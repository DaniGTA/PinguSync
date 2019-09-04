import { MediaType } from '../../controller/objects/meta/media-type';
import WatchProgress from '../../controller/objects/meta/watch-progress';
import MultiProviderResult from '../multi-provider-result';
import Series from '../../controller/objects/series';
import { ListProviderLocalData } from '../../controller/objects/list-provider-local-data';
import InfoProvider from '../info-provider';
import request from 'request';
import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';

export default class OMDbProvider implements InfoProvider {
    isOffline: boolean = false;
    hasOAuthCode: boolean = false;
    providerName: string = "omdb";
    hasUniqueIdForSeasons: boolean = true;
    supportedMediaTypes: MediaType[] = [MediaType.MOVIE, MediaType.SERIES];
    version: number = 1;
    apikey = "728e1e03";

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
    async  updateEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        throw new Error("Method not implemented.");
    }
    async removeEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        throw new Error("Method not implemented.");
    }

    async getMoreSeriesInfoByName(searchTitle: string, season?: number | undefined): Promise<MultiProviderResult[]> {
        try {
            const result = await this.webRequest('https://www.omdbapi.com/?apikey=' + this.apikey + "&s=" + searchTitle);
            console.log(result);
        } catch (err) {
            console.log(err);
        }
        throw new Error("Test");
    }
    async getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult> {
        const result = await this.webRequest('https://www.omdbapi.com/?apikey=' + this.apikey + "$i=" + provider.id);
        throw new Error("Method not implemented.");
    }


    private async webRequest<T>(url: string, method = 'GET'): Promise<T> {
        console.log('[OMDb] Start WebRequest');
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
                            console.log('[OMDb] status code: ' + response.statusCode);
                            if (response.statusCode === 200 || response.statusCode === 201) {
                                var data: T = JSON.parse(body) as T;
                                resolve(data);
                            } else {
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
