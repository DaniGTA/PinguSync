import InfoProvider from '../info-provider';
import request from 'request';
import { TVDBLogin } from './models/login';
import TVDBConverter from './tvdb-converter';
import { TVDBSeries } from './models/getSeries';
import SeriesSearchResults from './models/searchResults';
import { TVDBProviderData } from './tvdb-provider-data';
import { MediaType } from '../../controller/objects/meta/media-type';
import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import MultiProviderResult from '../multi-provider-result';

export default class TVDBProvider implements InfoProvider {
    public supportedMediaTypes: MediaType[] = [MediaType.ANIME, MediaType.SERIES, MediaType.SPECIAL];
    public providerName = 'tvdb'
    public isOffline = false;
    public hasUniqueIdForSeasons = false;
    public version = 1;
    private apiKey = '790G98VXW5MZHGV0';
    private baseUrl = 'https://api.thetvdb.com';
    private apiData: TVDBProviderData = new TVDBProviderData();
    public static Instance: TVDBProvider;
    get Instance():TVDBProvider {
        if (TVDBProvider.Instance) {
            return TVDBProvider.Instance;
        }
        return new TVDBProvider();
    }

    constructor() {
        if (!TVDBProvider.Instance) {
            TVDBProvider.Instance = this;
        }
    }

    public async getMoreSeriesInfoByName(searchTitle: string): Promise<MultiProviderResult[]> {
        const result = [];
        try {
            const tvDbConverter = new TVDBConverter();
            const data = await this.webRequest<SeriesSearchResults>(this.baseUrl + '/search/series?name=' + encodeURI(searchTitle));

            if (data.data) {
                for (const searchResult of data.data) {
                    result.push(new MultiProviderResult(await tvDbConverter.convertSearchResultToSeries(searchResult)));
                }
            }
        } catch (err) { }
        return result;
    }
    async getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult> {
        const tvDbConverter = new TVDBConverter();
        const data = await this.webRequest<TVDBSeries>(this.baseUrl + '/series/' + provider.id);

        return new MultiProviderResult(await tvDbConverter.convertSeriesToProviderLocalData(data));
    }

    private async getAccessKey(): Promise<string> {
        if (TVDBProvider.Instance.apiData.accessToken && TVDBProvider.Instance.apiData.expiresIn && new Date().getTime() < TVDBProvider.Instance.apiData.expiresIn) {
            return TVDBProvider.Instance.apiData.accessToken;
        } else {
            const token = await new Promise<string>((resolve, reject) => {
                request({
                    method: 'POST',
                    url: TVDBProvider.Instance.baseUrl + '/login',
                    headers: { 'Content-Type': 'application/json' },
                    body: `{
                        "apikey": "`+ TVDBProvider.Instance.apiKey + `"
                    }`
                }, (error: any, response: any, body: string) => {
                    if (response.statusCode === 200 || response.statusCode === 201) {
                        resolve((JSON.parse(body) as TVDBLogin).token);
                    } else {
                        reject();
                    }
                }).on('error', (err) => {
                    console.log(err);
                    reject();
                })
            })
            const dayInms = 86400000;
            TVDBProvider.Instance.apiData.setTokens(token, new Date().getTime() + dayInms);
            return token;
        }
    }

    private async webRequest<T>(url: string, method = 'GET', body?: string): Promise<T> {
        console.log('[TVDB] Start WebRequest');
        return new Promise<any>((resolve, reject) => {
            (async () => {
                try {
                    request({
                        method: method,
                        url,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + await TVDBProvider.Instance.getAccessKey(),
                        },

                        body: body,
                        timeout: 5000
                    }, (error: any, response: any, body: any) => {
                        try {
                            if (response.statusCode === 200 || response.statusCode === 201) {
                                var data: T = JSON.parse(body) as T;
                                resolve(data);
                            } else {
                                console.log('[TVDB] status code: ' + response.statusCode);
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
