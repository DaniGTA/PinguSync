import { MediaType } from '../../../controller/objects/meta/media-type';
import WatchProgress from '../../../controller/objects/meta/watch-progress';
import Series from '../../../controller/objects/series';
import { InfoProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderNameManager from '../../../controller/provider-controller/provider-manager/provider-name-manager';
import WebRequestManager from '../../../controller/web-request-manager/web-request-manager';
import logger from '../../../logger/logger';
import ExternalInformationProvider from '../../provider/external-information-provider';
import ListProvider from '../../provider/list-provider';
import MultiProviderResult from '../../provider/multi-provider-result';
import TVDBProvider from '../tvdb/tvdb-provider';
import { FullShowInfo } from './objects/fullShowInfo';
import { TraktSearch } from './objects/search';
import ITraktShowSeasonInfo from './objects/showSeasonInfo';
import { TraktUserInfo } from './objects/userInfo';
import { WatchedInfo } from './objects/watchedInfo';
import traktConverter from './trakt-converter';
import { TraktUserData } from './trakt-user-data';
import { UserInfoSmall } from './objects/userInfoSmall';
import Episode from '../../../controller/objects/meta/episode/episode';
export default class TraktProvider extends ListProvider {

    public async markEpisodeAsUnwatched(episode: Episode): Promise<void> {

    }

    public async markEpisodeAsWatched(episode: Episode): Promise<void> {

    }

    public getAllLists(): Promise<import('../../../controller/objects/provider-user-list').default[]> {
        throw new Error('Method not implemented.');
    }

    public async getUsername(): Promise<string> {
        const a = 'https://api.trakt.tv/users/' + this.userData.username;
        const b = await this.traktRequest<UserInfoSmall>(a);
        return b.name ?? b.username;

    }

    public logoutUser(): void {
        this.userData.removeTokens();
    }

    public static getInstance(): TraktProvider {
        if (!TraktProvider.instance) {
            TraktProvider.instance = new TraktProvider();
            // ... any one time initialization goes here ...
        }
        return TraktProvider.instance;
    }
    private static instance: TraktProvider;
    public supportedMediaTypes: MediaType[] = [MediaType.ANIME, MediaType.MOVIE, MediaType.SERIES, MediaType.SPECIAL];
    public supportedOtherProvider: Array<(new () => ExternalInformationProvider)> = [TVDBProvider];
    public potentialSubProviders: Array<(new () => ExternalInformationProvider)> = [TVDBProvider];
    public hasUniqueIdForSeasons = false;
    public hasEpisodeTitleOnFullInfo = true;
    public providerName = 'Trakt';
    public hasOAuthLogin = true;
    public hasDefaultLogin = false;
    public userData: TraktUserData;
    public version = 1;

    private redirectUri = 'http://localhost:3000/callback';
    constructor() {
        super();
        if (TraktProvider.instance) {
            this.userData = TraktProvider.instance.userData;
        } else {
            TraktProvider.instance = this;
            this.userData = new TraktUserData();
        }
    }
    public async addOAuthCode(code: string): Promise<boolean> {
        const options = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            json: {
                // eslint-disable-next-line @typescript-eslint/camelcase
                client_id: this.getApiId(),
                // eslint-disable-next-line @typescript-eslint/camelcase
                client_secret: this.getApiSecret(),
                code,  // The Authorization Code received previously
                // eslint-disable-next-line @typescript-eslint/camelcase
                grant_type: 'authorization_code',
                // eslint-disable-next-line @typescript-eslint/camelcase
                redirect_uri: this.redirectUri,
            },
            method: 'POST',
            uri: 'https://api.trakt.tv/oauth/token',
        };
        this.informAWebRequest();
        const response = await WebRequestManager.request(options);

        if (response.body.access_token) {
            const body = response.body;
            this.userData.setTokens(body.access_token, body.refresh_token, body.expires_in);
            this.getUserInfo();
            return true;
        }
        return false;
    }

    public async getMoreSeriesInfoByName(seriesName: string): Promise<MultiProviderResult[]> {
        const endResult: MultiProviderResult[] = [];
        const searchResults = await this.traktRequest<TraktSearch[]>('https://api.trakt.tv/search/movie,show?query=' + encodeURI(seriesName));
        for (const result of searchResults) {
            try {
                if (result.show) {
                    endResult.push(await traktConverter.convertShowToLocalData(result.show));
                }
                if (result.movie) {
                    endResult.push(await traktConverter.convertMovieToLocalData(result.movie));
                }
            } catch (err) {
                logger.error(err);
            }
        }
        return endResult;
    }

    public async isProviderAvailable(): Promise<boolean> {
        return true;
    }

    public async getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult> {
        try {
            if (provider.provider === this.providerName) {
                if (provider.isMediaTypeMovie()) {
                    const res = await this.traktRequest<FullShowInfo>('https://api.trakt.tv/movies/' + provider.id + '?extended=full');
                    return (traktConverter.convertFullShowInfoToLocalData(res, MediaType.MOVIE));
                } else {
                    const res = await this.traktRequest<FullShowInfo>('https://api.trakt.tv/shows/' + provider.id + '?extended=full');
                    this.waitUntilItCanPerfomNextRequest();
                    const seasonEpisodeInfo = await this.traktRequest<ITraktShowSeasonInfo[]>('https://api.trakt.tv/shows/' + res.ids.trakt + '/seasons?extended=episodes');
                    this.waitUntilItCanPerfomNextRequest();
                    const seasonInfo = await this.traktRequest<ITraktShowSeasonInfo[]>('https://api.trakt.tv/shows/' + res.ids.trakt + '/seasons?extended=full');
                    const fullSeasonInfo = traktConverter.combineSeasonInfoAndSeasonEpisodeInfo(seasonInfo, seasonEpisodeInfo);
                    return traktConverter.convertFullShowInfoToLocalData(res, MediaType.UNKOWN_SERIES, fullSeasonInfo);
                }
            } else if (provider.provider === ProviderNameManager.getProviderName(TVDBProvider)) {
                const res = await this.traktRequest<TraktSearch[]>('https://api.trakt.tv/search/tvdb/' + provider.id + '?extended=full');
                for (const result of res) {
                    try {
                        if (result.show) {
                            return await traktConverter.convertShowToLocalData(result.show);
                        }
                        if (result.movie) {
                            return await traktConverter.convertMovieToLocalData(result.movie);
                        }
                    } catch (err) {
                        logger.error(err);
                    }
                }

            }
        } catch (err) {
            logger.error('[TRAKT] ID REQUEST FAILED');
            throw err;
        }
        throw new Error('[Trakt] Cant handle this Provider id');
    }

    public getTokenAuthUrl(): string {
        return 'https://trakt.tv/oauth/authorize?response_type=code&client_id=' + this.getApiId() + '&redirect_uri=' + this.redirectUri;
    }
    public async isUserLoggedIn(): Promise<boolean> {
        return this.userData.accessToken !== '';
    }
    public async getAllSeries(disableCache = false): Promise<MultiProviderResult[]> {
        logger.log('info', '[Request] -> Trakt -> AllSeries');
        if (this.userData.list != null && this.userData.list.length !== 0 && !disableCache) {
            return this.userData.list;
        } else if (this.userData.userInfo != null) {
            const seriesList: MultiProviderResult[] = [];
            const data = await this.traktRequest<WatchedInfo[]>('https://api.trakt.tv/users/' + this.userData.userInfo.user.ids.slug + '/watched/shows');
            for (const entry of data) {
                try {
                    seriesList.push(...await traktConverter.convertSeasonsToMultiProviderResult(entry));
                } catch (e) {
                    logger.error(e);
                }
            }
            this.userData.updateList(seriesList);
            return seriesList;
        }
        return [];
    }

    public async getUserInfo() {
        const data = await this.traktRequest<TraktUserInfo>('https://api.trakt.tv/users/settings');
        this.userData.setUserData(data);
    }

    public async updateEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        const providerInfo = anime.getListProvidersInfos().find((x) => x.provider === this.providerName);
        if (typeof providerInfo !== 'undefined') {
            //providerInfo.addOneWatchProgress(watchProgress);
            const updatedEntry = await traktConverter.convertAnimeToSendEntryShow(anime, watchProgress.episode);
            await this.traktRequest('https://api.trakt.tv/sync/history', 'POST', JSON.stringify(updatedEntry));
            return providerInfo;
        }
        throw new Error('err');
    }

    public async removeEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        const providerInfo = anime.getListProvidersInfos().find((x) => x.provider === this.providerName);
        if (typeof providerInfo !== 'undefined') {
            //providerInfo.removeOneWatchProgress(watchProgress);
            const updatedEntry = await traktConverter.convertAnimeToSendRemoveEntryShow(anime, watchProgress.episode);
            await this.traktRequest('https://api.trakt.tv/sync/history/remove', 'POST', JSON.stringify(updatedEntry));
            return providerInfo;
        }
        throw new Error('err');
    }

    public async logInUser(code: string): Promise<boolean> {
        throw new Error('cant login user with credentials');
    }

    private async traktRequest<T>(url: string, method = 'GET', body?: string): Promise<T> {
        this.informAWebRequest();
        logger.log('info', '[Trakt] Start WebRequest ♗');

        const response = await WebRequestManager.request({
            body,
            headers: {
                'Authorization': 'Bearer ' + this.userData.accessToken,
                'Content-Type': 'application/json',
                'trakt-api-key': this.getApiId(),
                'trakt-api-version': '2',
            },
            method,
            uri: url,
        });


        const responseBody = response.body;
        if (response.statusCode === 200 || response.statusCode === 201) {
            const data: T = JSON.parse(responseBody) as T;
            return data;
        } else if (response.statusMessage === 'Unauthorized' && response.statusCode === 401) {
            this.userData.removeTokens();
            logger.error('[Trakt] User is no longer logged in');
            throw new Error('[Trakt] User is not logged in: ' + response.statusCode);
        } else {
            logger.error('[Trakt] status code:' + response.statusCode);
            logger.error(responseBody);
            throw new Error('[Trakt] Status code error:' + response.statusCode);
        }
    }
}
