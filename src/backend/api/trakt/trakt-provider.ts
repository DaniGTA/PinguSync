import { ListProviderLocalData } from '../../controller/objects/list-provider-local-data';
import Series from '../../controller/objects/series';
import IListProvider from '../list-provider';
import { TraktSearch } from './objects/search';
import { TraktUserInfo } from './objects/userInfo';
import { WatchedInfo } from './objects/watchedInfo';
import { TraktUserData } from './trakt-user-data';

// tslint:disable-next-line: no-implicit-dependencies
import request from 'request';
import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import { MediaType } from '../../controller/objects/meta/media-type';
import WatchProgress from '../../controller/objects/meta/watch-progress';
import MultiProviderResult from '../multi-provider-result';
import { FullShowInfo } from './objects/fullShowInfo';
import { TraktShowSeasonInfo } from './objects/showSeasonInfo';
import traktConverter from './trakt-converter';
export default class TraktProvider implements IListProvider {

    public static getInstance() {
        if (!TraktProvider.instance) {
            TraktProvider.instance = new TraktProvider();
            // ... any one time initialization goes here ...
        }
        return TraktProvider.instance;
    }
    private static instance: TraktProvider;
    public supportedMediaTypes: MediaType[] = [MediaType.ANIME, MediaType.MOVIE, MediaType.SERIES, MediaType.SPECIAL];
    public hasUniqueIdForSeasons: boolean = false;
    public providerName: string = 'Trakt';
    public hasOAuthCode = true;
    public userData: TraktUserData;
    public version = 1;

    private clientSecret = '9968dd9718a5aa812431980a045999547eefa48be7e0e9c638e329e5f9d6a0b2';
    private clientId = '94776660ee3bd9e7b35ec07378bc6075b71dfc58129b2a3933dce2c3126f5fdd';
    private redirectUri = 'urn:ietf:wg:oauth:2.0:oob';
    constructor() {
        TraktProvider.instance = this;
        this.userData = new TraktUserData();
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
                console.error(err);
            }
        }
        return endResult;
    }

    public async isProviderAvailable(): Promise<boolean> {
        return true;
    }

    public async getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult> {
        if (provider.isMediaTypeMovie()) {
            const res = await this.traktRequest<FullShowInfo>('https://api.trakt.tv/movies/' + provider.id);
            return (traktConverter.convertFullShowInfoToLocalData(res));
        } else {
            const res = await this.traktRequest<FullShowInfo>('https://api.trakt.tv/shows/' + provider.id);
            const seasonInfo = await this.traktRequest<TraktShowSeasonInfo[]>('https://api.trakt.tv/shows/' + res.ids.trakt + '/seasons?extended=episodes');
            return (traktConverter.convertFullShowInfoToLocalData(res, seasonInfo));
        }

    }

    public getTokenAuthUrl(): string {
        return 'https://trakt.tv/oauth/authorize?response_type=code&client_id=' + this.clientId + '&redirect_uri=' + this.redirectUri;
    }
    public async isUserLoggedIn(): Promise<boolean> {
        return this.userData.accessToken !== '';
    }
    public async getAllSeries(disableCache: boolean = false): Promise<Series[]> {
        console.log('[Request] -> Trakt -> AllSeries');
        if (this.userData.list != null && this.userData.list.length !== 0 && !disableCache) {
            return this.userData.list;
        } else if (this.userData.userInfo != null) {
            const seriesList: Series[] = [];
            const data = await this.traktRequest<WatchedInfo[]>('https://api.trakt.tv/users/' + this.userData.userInfo.user.ids.slug + '/watched/shows');
            for (const entry of data) {
                try {
                    seriesList.push(...await traktConverter.convertSeasonsToSeries(entry));
                } catch (e) {
                    console.error(e);
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
            providerInfo.addOneWatchProgress(watchProgress);
            const updatedEntry = await traktConverter.convertAnimeToSendEntryShow(anime, watchProgress.episode);
            await this.traktRequest('https://api.trakt.tv/sync/history', 'POST', JSON.stringify(updatedEntry));
            return providerInfo;
        }
        throw new Error('err');
    }

    public async removeEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        const providerInfo = anime.getListProvidersInfos().find((x) => x.provider === this.providerName);
        if (typeof providerInfo !== 'undefined') {
            providerInfo.removeOneWatchProgress(watchProgress);
            const updatedEntry = await traktConverter.convertAnimeToSendRemoveEntryShow(anime, watchProgress.episode);
            await this.traktRequest('https://api.trakt.tv/sync/history/remove', 'POST', JSON.stringify(updatedEntry));
            return providerInfo;
        }
        throw new Error('err');
    }

    public logInUser(code: string) {
        const that = this;
        const options = {
            uri: 'https://api.trakt.tv/oauth/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            json: {
                grant_type: 'authorization_code',
                client_id: this.clientId,
                client_secret: this.clientSecret,
                redirect_uri: this.redirectUri,
                code, // The Authorization Code received previously
            },
        };
        return new Promise<boolean>((resolve, reject) => {
            request(options, (error: any, response: any, body: any) => {
                if (body.access_token) {
                    that.userData.setTokens(body.access_token, body.refresh_token, body.expires_in);
                    that.getUserInfo();
                    resolve();
                } else {
                    reject();
                }
            }).on('error', (err) => {
                console.log(err);
                reject();
            });
        });
    }

    private traktRequest<T>(url: string, method = 'GET', body?: string): Promise<T> {
        console.log('[Trakt] Start WebRequest');
        const that = this;
        return new Promise<T>((resolve, reject) => {
            try {
                request({
                    method: method,
                    url,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + that.userData.accessToken,
                        'trakt-api-version': '2',
                        'trakt-api-key': that.clientId,
                    },
                    body: body,
                }, (error: any, response: any, body: any) => {
                    try {

                        if (response.statusCode === 200 || response.statusCode === 201) {
                            const data: T = JSON.parse(body) as T;
                            resolve(data);
                        } else {
                            console.error('[Trakt] status code:', response.statusCode);
                            reject();
                        }
                    } catch (err) {
                        console.error(err);
                        reject();
                    }
                }).on('error', (err) => {
                    console.error(err);
                    reject();
                });
            } catch (err) {
                console.error(err);
                reject();
            }
        });
    }
}
