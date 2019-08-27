import InfoProvider from '../info-provider';
import Series from '../../controller/objects/series';

import request from 'request';
import { TVDBLogin } from './models/login';
import TVDBConverter from './tvdb-converter';
import { TVDBSeries } from './models/getSeries';
import SeriesSearchResults from './models/searchResults';
import seriesHelper from '../../helpFunctions/series-helper';
import { TVDBProviderData } from './tvdb-provider-data';

export default class TVDBProvider implements InfoProvider {
    public providerName = 'tvdb'
    public isOffline = false;
    public hasUniqueIdForSeasons = false;
    private apiKey = '790G98VXW5MZHGV0';
    private baseUrl = 'https://api.thetvdb.com';
    private apiData: TVDBProviderData = new TVDBProviderData();
    public static Instance: TVDBProvider;
    constructor() {
        TVDBProvider.Instance = this;
    }

    public async getMoreSeriesInfoByName(series: Series, searchTitle: string): Promise<Series> {
        try {
            const tvDbConverter = new TVDBConverter();
            let id: string | number | undefined;
            const index = series.getInfoProvidersInfos().findIndex(entry => entry.provider == this.providerName);
            if (index === -1) {
                const data = await this.webRequest<SeriesSearchResults>(this.baseUrl + '/search/series?name=' + encodeURI(searchTitle));
                if (data.data) {
                    for (const searchResult of data.data) {
                        const series2: Series = await tvDbConverter.convertSearchResultToSeries(searchResult);
                        if (await seriesHelper.isSameSeries(series, series2)) {
                            id = (await tvDbConverter.convertSearchResultToProviderLocalData(searchResult)).id;
                            break;
                        }
                    }
                }
            } else {
                id = series.getInfoProvidersInfos()[index].id;
            }
            if (id) {
                const data = await this.webRequest<TVDBSeries>(this.baseUrl + '/series/' + id);
                await series.addInfoProvider(await tvDbConverter.convertSeriesToProviderLocalData(data));
                return series;
            }

        } catch (err) {
            console.log(err);
        }
        throw 'no tvdb id';
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
                            console.log('[TVDB] status code: ' + response.statusCode);
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
