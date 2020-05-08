// tslint:disable-next-line: no-implicit-dependencies
import { MediaType } from '../../../controller/objects/meta/media-type';
import Series from '../../../controller/objects/series';
import { InfoProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import WebRequestManager from '../../../controller/web-request-manager/web-request-manager';
import logger from '../../../logger/logger';
import ExternalInformationProvider from '../../provider/external-information-provider';
import InfoProvider from '../../provider/info-provider';
import MultiProviderResult from '../../provider/multi-provider-result';
import { IdRequestResult } from './models/id-request-result';
import { SearchResults } from './models/search-results';
import OMDbConverter from './omdb-converter';

export default class OMDbProvider extends InfoProvider {
    public static instance: OMDbProvider;
    public isOffline = false;
    public hasOAuthCode = false;
    public providerName = 'omdb';
    public hasUniqueIdForSeasons = false;
    public supportedMediaTypes: MediaType[] = [MediaType.MOVIE, MediaType.SERIES];
    public supportedOtherProvider: Array<(new () => ExternalInformationProvider)> = [];
    public potentialSubProviders: Array<(new () => ExternalInformationProvider)> = [];
    public version = 1;
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
            const result = await this.webRequest<SearchResults>('https://www.omdbapi.com/?apikey=' + this.getApiSecret() + '&s=' + encodeURI(searchTitle));
            if (result.Search) {
                for (const resultEntry of result.Search) {
                    results.push(converter.convertSearchResult(resultEntry));
                }
            }

        } catch (err) {
            logger.error(err);
        }
        return results;
    }
    public async getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult> {
        if (provider.provider === this.providerName) {

            try {
                const converter = new OMDbConverter();
                const result = await this.webRequest<IdRequestResult>('https://www.omdbapi.com/?apikey=' + this.getApiSecret() + '&i=' + provider.id);
                return converter.convertIdRequest(result);
            } catch (err) {
                logger.error(err);
                throw new Error(err);
            }
        }
        throw new Error('[Omdb] Cant handle this provider id');
    }


    private async webRequest<T>(url: string, method = 'GET'): Promise<T> {
        this.informAWebRequest();
        const request = {
            headers: {
                'Content-Type': 'application/json',
            },
            method,
            timeout: 5000,
            uri: url,
        };
        const response = await WebRequestManager.request(request);
        try {
            if (response.statusCode === 200 || response.statusCode === 201) {
                const data: T = JSON.parse(response.body) as T;
                return data;
            } else {
                logger.error('[OMDb] status code: ' + response.statusCode);
                throw response.statusCode;
            }
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }
}
