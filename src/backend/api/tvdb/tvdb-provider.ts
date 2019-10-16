// tslint:disable-next-line: no-implicit-dependencies
import request from 'request';
import { MediaType } from '../../controller/objects/meta/media-type';
import { InfoProviderLocalData } from '../../controller/provider-manager/local-data/info-provider-local-data';
import logger from '../../logger/logger';
import ExternalProvider from '../provider/external-provider';
import InfoProvider from '../provider/info-provider';
import MultiProviderResult from '../provider/multi-provider-result';
import { TVDBSeries } from './models/getSeries';
import { TVDBLogin } from './models/login';
import SeriesSearchResults from './models/searchResults';
import TVDBConverter from './tvdb-converter';
import { TVDBProviderData } from './tvdb-provider-data';

export default class TVDBProvider extends InfoProvider {
    public static Instance: TVDBProvider;
    public supportedMediaTypes: MediaType[] = [MediaType.ANIME, MediaType.SERIES, MediaType.SPECIAL];
    public supportedOtherProvider: Array<(new () => ExternalProvider)> = [];
    public providerName = 'tvdb';
    public isOffline = false;
    public hasUniqueIdForSeasons = false;
    public version = 1;
    private apiKey = '790G98VXW5MZHGV0';
    private baseUrl = 'https://api.thetvdb.com';
    private apiData: TVDBProviderData = new TVDBProviderData();

    get Instance(): TVDBProvider {
        if (TVDBProvider.Instance) {
            return TVDBProvider.Instance;
        }
        return new TVDBProvider();
    }

    constructor() {
        super();
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
        } catch (err) {
            logger.error(err);
        }
        return result;
    }
    public async getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult> {
        const tvDbConverter = new TVDBConverter();
        const data = await this.webRequest<TVDBSeries>(this.baseUrl + '/series/' + provider.id);

        return new MultiProviderResult(await tvDbConverter.convertSeriesToProviderLocalData(data));
    }


    public async isProviderAvailable(): Promise<boolean> {
        return true;
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
                        "apikey": "` + TVDBProvider.Instance.apiKey + `"
                    }`,
                }, (error: any, response: any, body: string) => {
                    if (response.statusCode === 200 || response.statusCode === 201) {
                        resolve((JSON.parse(body) as TVDBLogin).token);
                    } else {
                        reject();
                    }
                }).on('error', (err) => {
                    logger.error(err);
                    reject();
                });
            });
            const dayInms = 86400000;
            TVDBProvider.Instance.apiData.setTokens(token, new Date().getTime() + dayInms);
            return token;
        }
    }

    private async webRequest<T>(url: string, method = 'GET', body?: string): Promise<T> {
        logger.log('info', '[TVDB] Start WebRequest');
        return new Promise<any>((resolve, reject) => {
            (async () => {
                try {
                    request({
                        method,
                        url,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + await TVDBProvider.Instance.getAccessKey(),
                        },

                        body,
                        timeout: 5000,
                    }, (error: any, response: any, body: any) => {
                        try {
                            if (response.statusCode === 200 || response.statusCode === 201) {
                                const data: T = JSON.parse(body) as T;
                                resolve(data);
                            } else {
                                logger.error('[TVDB] status code: ' + response.statusCode);
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
