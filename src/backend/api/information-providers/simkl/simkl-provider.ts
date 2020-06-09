// tslint:disable-next-line: no-implicit-dependencies
import { MediaType } from '../../../controller/objects/meta/media-type';
import WatchProgress from '../../../controller/objects/meta/watch-progress';
import Series from '../../../controller/objects/series';

import { InfoProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import WebRequestManager from '../../../controller/web-request-manager/web-request-manager';
import logger from '../../../logger/logger';
import ExternalInformationProvider from '../../provider/external-information-provider';
import ListProvider from '../../provider/list-provider';
import MultiProviderResult from '../../provider/multi-provider-result';
import AniDBProvider from '../anidb/anidb-provider';
import MalProvider from '../mal/mal-provider';
import TVDBProvider from '../tvdb/tvdb-provider';
import CodeResponse from './objects/codeResponse';
import { ISimklEpisodeInfo } from './objects/simklEpisodeInfo';
import { SimklErrorResponse } from './objects/simklErrorResponse';
import { ISimklFullInfoAnimeResponse } from './objects/simklFullInfoAnimeResponse';
import { ISimklFullInfoMovieResponse } from './objects/simklFullInfoMovieResponse';
import { ISimklFullInfoSeriesResponse } from './objects/simklFullInfoSeriesResponse';
import { ISimklTextSearchResults } from './objects/simklTextSearchResults';
import { UserListResponse } from './objects/userListResonse';
import SimklConverter from './simkl-converter';
import { SimklUserData } from './simkl-user-data';

export default class SimklProvider extends ListProvider {
    public getAllLists(): Promise<import('../../../controller/objects/provider-user-list').default[]> {
        throw new Error('Method not implemented.');
    }
    public getUsername(): Promise<string> {
        throw new Error('Method not implemented.');
    }
    public logoutUser(): void {
        throw new Error('Method not implemented.');
    }

    public static instance: SimklProvider;
    public userData: SimklUserData = new SimklUserData();
    public supportedMediaTypes: MediaType[] = [MediaType.ANIME, MediaType.MOVIE, MediaType.SERIES, MediaType.SPECIAL];
    public supportedOtherProvider: Array<(new () => ExternalInformationProvider)> = [];
    public potentialSubProviders: Array<(new () => ExternalInformationProvider)> = [TVDBProvider, AniDBProvider, MalProvider];
    public providerName = 'Simkl';
    public version = 2;
    public hasOAuthLogin = true;
    public hasDefaultLogin = false;
    public hasUniqueIdForSeasons = true;
    public requestRateLimitInMs = 1500;
    private redirectUri = 'http://localhost:3000/callback';
    private apiUrl = 'https://api.simkl.com/';
    private timeout?: number;
    private simklConverter = new SimklConverter();
    constructor() {
        super();
        SimklProvider.instance = this;
    }

    public async markEpisodeAsUnwatched(episode: Episode): Promise<void> {

    }

    public async markEpisodeAsWatched(episode: Episode): Promise<void> {

    }

    public async addOAuthCode(code: string): Promise<boolean> {
        const result = await this.simklRequest<CodeResponse>(this.apiUrl + 'oauth/pin/' + code + '?client_id=' + this.getApiId());
        if (result.access_token) {
            this.userData.setAccessToken(result.access_token);
            return true;
        }

        return false;
    }

    public async getMoreSeriesInfoByName(seriesName: string): Promise<MultiProviderResult[]> {
        const endResults: MultiProviderResult[] = [];
        try {
            endResults.push(...await this.animeTextSearch(seriesName));
        } catch (err) { logger.debug(err); }
        await this.waitUntilItCanPerfomNextRequest();
        try {
            endResults.push(...await this.tvTextSearch(seriesName));
        } catch (err) { logger.debug(err); }
        await this.waitUntilItCanPerfomNextRequest();
        try {
            endResults.push(...await this.movieTextSearch(seriesName));
        } catch (err) { logger.debug(err); }

        return endResults;
    }

    public async getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult> {
        if (provider.provider === this.providerName) {
            if (provider.mediaType === MediaType.ANIME) {
                const result = await this.getFullAnimeInfo(provider.id);
                if (result) {
                    return result;
                }
            } else if (provider.mediaType === MediaType.MOVIE) {
                const url = this.apiUrl + 'movie/' + provider.id + '?extended=full&client_id=' + this.getApiId();
                const result = await this.simklRequest<ISimklFullInfoMovieResponse>(url);
                if (result) {
                    return this.simklConverter.convertFullMovieInfoToProviderLocalData(result);
                }
            } else if (provider.mediaType === MediaType.SERIES) {
                const url = this.apiUrl + 'tv/' + provider.id + '?extended=full&client_id=' + this.getApiId();
                const result = await this.simklRequest<ISimklFullInfoSeriesResponse>(url);
                if (result) {
                    return this.simklConverter.convertFullSeriesInfoToProviderLocalData(result);
                }
            } else {
                throw new Error('no media type for simkl');
            }
        }
        throw new Error('no result in simkl');
    }

    public async getAllSeries(disableCache?: boolean | undefined): Promise<MultiProviderResult[]> {
        const result = await this.simklRequest<UserListResponse>(this.apiUrl + 'sync/all-items/anime/?extended=full');
        const resultList: MultiProviderResult[] = [];
        for (const anime of result.anime) {
            // TODO
        }
        for (const anime of result.movies) {
            // TODO
        }
        for (const anime of result.shows) {
            // TODO
        }
        return resultList;
    }
    public async logInUser(code: string): Promise<boolean> {
        throw new Error('Userlogin not supported');

    }
    public async isUserLoggedIn(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    public getTokenAuthUrl(): string {
        return 'https://api.simkl.com/oauth/pin?client_id=' + this.getApiId() + '&redirect=' + this.redirectUri;
    }
    public async updateEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        throw new Error('Method not implemented.');
    }
    public async removeEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        throw new Error('Method not implemented.');
    }

    public async isProviderAvailable(): Promise<boolean> {
        if (this.timeout && this.timeout > Date.now()) {
            return false;
        }
        return true;
    }

    private async animeTextSearch(text: string): Promise<MultiProviderResult[]> {
        const result = await this.simklRequest<ISimklTextSearchResults[]>(this.apiUrl + 'search/anime?q=' + text + '&page=1&limit=50&extended=full&client_id=' + this.getApiId());
        return this.simklConverter.convertSimklTextSearchResultsToMultiProviderResults(result, MediaType.ANIME);
    }

    private async tvTextSearch(text: string): Promise<MultiProviderResult[]> {
        const result = await this.simklRequest<ISimklTextSearchResults[]>(this.apiUrl + 'search/tv?q=' + text + '&page=1&limit=50&extended=full&client_id=' + this.getApiId());
        return this.simklConverter.convertSimklTextSearchResultsToMultiProviderResults(result, MediaType.SERIES);
    }

    private async movieTextSearch(text: string): Promise<MultiProviderResult[]> {
        const result = await this.simklRequest<ISimklTextSearchResults[]>(this.apiUrl + 'search/movie?q=' + text + '&page=1&limit=50&extended=full&client_id=' + this.getApiId());
        return this.simklConverter.convertSimklTextSearchResultsToMultiProviderResults(result, MediaType.MOVIE);
    }

    private async getFullAnimeInfo(id: string | number): Promise<MultiProviderResult> {
        const fullInfoUrl = this.apiUrl + 'anime/' + id + '?extended=full&client_id=' + this.getApiId();
        const fullInfoResult = await this.simklRequest<ISimklFullInfoAnimeResponse>(fullInfoUrl);
        await this.waitUntilItCanPerfomNextRequest();
        const episodeInfoResultUrl = this.apiUrl + 'anime/episodes/' + id + '?client_id=' + this.getApiId();
        const episodeInfoResult = await this.simklRequest<ISimklEpisodeInfo[]>(episodeInfoResultUrl);
        return this.simklConverter.convertFullAnimeInfoToProviderLocalData(fullInfoResult, episodeInfoResult);
    }

    private async simklRequest<T>(url: string, method = 'GET', body?: string): Promise<T> {
        this.informAWebRequest();
        if (!await this.isProviderAvailable()) {
            throw new Error('timeout active');
        }

        try {
            const response = await WebRequestManager.request({
                method: method,
                uri: url,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.userData.accessToken,
                },
                body: body,
                timeout: 1000,
            });
            logger.log('info', '[Simkl] Start WebRequest');

            if (response.statusCode === 200 || response.statusCode === 201) {
                const data: T = JSON.parse(response.body) as T;
                return data;
            } else if (response.statusCode === 412) {
                const e: SimklErrorResponse = (JSON.parse(response.body)) as SimklErrorResponse;
                if (e.message === 'Total Requests Limit Exceeded') {
                    const date = new Date();
                    date.setHours(date.getHours() + 24);
                    this.timeout = date.getTime();
                }
                throw new Error('[Simkl] Reached request limit');
            } else {
                logger.error('[Simkl] status code:', response.statusCode);
                throw new Error('[Simkl] status code:' + response.statusCode);
            }

        } catch (err) {
            logger.error(err);
            throw new Error(err);
        }

    }
}
