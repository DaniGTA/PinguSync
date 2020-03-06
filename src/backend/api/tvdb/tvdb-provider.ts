// tslint:disable-next-line: no-implicit-dependencies
import { MediaType } from '../../controller/objects/meta/media-type';
import { InfoProviderLocalData } from '../../controller/provider-manager/local-data/info-provider-local-data';
import WebRequestManager from '../../controller/web-request-manager/web-request-manager';
import logger from '../../logger/logger';
import ExternalProvider from '../provider/external-provider';
import InfoProvider from '../provider/info-provider';
import MultiProviderResult from '../provider/multi-provider-result';
import { TVDBSeries } from './models/getSeries';
import { TVDBLogin } from './models/login';
import ISeriesSearchResults from './models/searchResults';
import TVDBConverter from './tvdb-converter';
import { TVDBProviderData } from './tvdb-provider-data';

export default class TVDBProvider extends InfoProvider {
    public static Instance: TVDBProvider;
    public supportedMediaTypes: MediaType[] = [MediaType.ANIME, MediaType.SERIES, MediaType.SPECIAL];
    public supportedOtherProvider: Array<(new () => ExternalProvider)> = [];
    public potentialSubProviders: Array<(new () => ExternalProvider)> = [];
    public providerName = 'tvdb';
    public isOffline = false;
    public hasUniqueIdForSeasons = false;
    public version = 1;
    private apiKey = '790G98VXW5MZHGV0';
    private baseUrl = 'https://api.thetvdb.com';
    private apiData: TVDBProviderData;

    get Instance(): TVDBProvider {
        if (TVDBProvider.Instance) {
            return TVDBProvider.Instance;
        }
        return new TVDBProvider();
    }

    constructor() {
        super();
        if (TVDBProvider.Instance) {
            this.apiData = TVDBProvider.Instance.apiData;
        } else {
            TVDBProvider.Instance = this;
            this.apiData = new TVDBProviderData();
        }
    }

    public async getMoreSeriesInfoByName(searchTitle: string): Promise<MultiProviderResult[]> {
        const result = [];
        try {
            const tvDbConverter = new TVDBConverter();
            searchTitle = searchTitle.replace('&', 'and');
            const data = await this.webRequest<ISeriesSearchResults>(this.baseUrl + '/search/series?name=' + encodeURI(searchTitle));

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
        if (provider.provider === this.providerName) {
            const tvDbConverter = new TVDBConverter();
            const data = await this.webRequest<TVDBSeries>(this.baseUrl + '/series/' + provider.id);

            return new MultiProviderResult(await tvDbConverter.convertSeriesToProviderLocalData(data));
        }
        throw new Error('[TVDB] Didnt support this provider id');
    }


    public async isProviderAvailable(): Promise<boolean> {
        return true;
    }

    private async getAccessKey(): Promise<string> {
        this.informAWebRequest();
        if (TVDBProvider.Instance.apiData.accessToken && TVDBProvider.Instance.apiData.expiresIn && new Date().getTime() < TVDBProvider.Instance.apiData.expiresIn) {
            return TVDBProvider.Instance.apiData.accessToken;
        } else {
            let token: string | null = null;
            const data = await WebRequestManager.request({
                method: 'POST',
                uri: TVDBProvider.Instance.baseUrl + '/login',
                headers: { 'Content-Type': 'application/json' },
                body: `{
                        "apikey": "` + TVDBProvider.Instance.apiKey + `"
                    }`,
            });
            if (data.statusCode === 200 || data.statusCode === 201) {
                const loginData = (JSON.parse(data.body) as TVDBLogin);
                token = loginData.token;
            } else {
                throw new Error('[TVDB] Failed to get token');
            }
            const dayInms = 86400000;
            TVDBProvider.Instance.apiData.setTokens(token, new Date().getTime() + dayInms);
            return token;
        }
    }

    private async webRequest<T>(url: string, method = 'GET', body?: string): Promise<T> {
        this.informAWebRequest();

        try {
            const response = await WebRequestManager.request({
                method,
                uri: url,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + await this.getAccessKey(),
                },

                body,
                timeout: 5000,
            });

            if (response.statusCode === 200 || response.statusCode === 201) {
                const data: T = JSON.parse(response.body) as T;
                return data;
            } else {
                logger.error('[TVDB] status code: ' + response.statusCode);
                throw new Error('[TVDB] status code: ' + response.statusCode);
            }
        } catch (err) {
            logger.error(err);
            throw new Error(err);
        }
    }
}
