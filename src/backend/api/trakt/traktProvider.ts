import ListProvider from '../listProvider';
import { TraktUserInfo } from './objects/userInfo';
import { WatchedInfo } from './objects/watchedInfo';
import { TraktSearch } from './objects/search';
import { ProviderInfo } from '../../controller/objects/providerInfo';
import Anime, { WatchStatus } from '../../controller/objects/anime';
import { TraktUserData } from './traktUserData';

import request from 'request';
import Name from '../../../backend/controller/objects/name';
import traktConverter from './traktConverter';
import titleCheckHelper from '../../../backend/helpFunctions/titleCheckHelper';
import { FullShowInfo } from './objects/fullShowInfo';
import { WatchProgress } from '../../../backend/controller/objects/watchProgress';
export default class TraktProvider implements ListProvider {

    public static getInstance() {
        if (!TraktProvider.instance) {
            TraktProvider.instance = new TraktProvider();
            // ... any one time initialization goes here ...
        }
        return TraktProvider.instance;
    }
    private static instance: TraktProvider;

    public providerName: string = 'Trakt';
    public hasOAuthCode = true;
    public userData: TraktUserData;


    private clientSecret = '9968dd9718a5aa812431980a045999547eefa48be7e0e9c638e329e5f9d6a0b2';
    private clientId = '94776660ee3bd9e7b35ec07378bc6075b71dfc58129b2a3933dce2c3126f5fdd';
    private redirectUri = 'urn:ietf:wg:oauth:2.0:oob';
    constructor() {
        TraktProvider.instance = this;
        this.userData = new TraktUserData();
    }

    public async getMoreSeriesInfo(_anime: Anime): Promise<Anime> {
        var anime = Object.assign(new Anime(), _anime);
        anime.readdFunctions();
        var providerInfos = anime.providerInfos.find(x => x.provider === this.providerName);
        var id = null;
        if (typeof providerInfos != 'undefined') {
            id = providerInfos.id;
        } else {
            const searchResults = await this.traktRequest<TraktSearch[]>('https://api.trakt.tv/search/movie,show?query=' + await anime.names.getRomajiName());
            for (const result of searchResults) {
                try {
                    var b = await traktConverter.convertShowToAnime(result.show);
                    if (await titleCheckHelper.checkAnimeNames(anime, b)) {
                        var providerInfos = b.providerInfos.find(x => x.provider === this.providerName);
                        if (typeof providerInfos != 'undefined') {
                            id = providerInfos.id;
                        }
                    }
                } catch (err) { }
            }
        }
        if (id != null) {
            const res = await this.traktRequest<FullShowInfo>('https://api.trakt.tv/shows/' + id);
            return await (await traktConverter.convertFullShowInfoToAnime(res)).merge(anime);
        } else {
            throw 'NoMatch in TraktSearch';
        }
    }

    public getTokenAuthUrl(): string {
        return 'https://trakt.tv/oauth/authorize?response_type=code&client_id=' + this.clientId + '&redirect_uri=' + this.redirectUri;
    }
    public async isUserLoggedIn(): Promise<boolean> {
        return this.userData.accessToken !== '';
    }
    public async getAllSeries(disableCache: boolean = false): Promise<Anime[]> {
        console.log('[Request] -> Trakt -> AllSeries');
        if (this.userData.list != null && this.userData.list.length != 0 && !disableCache) {
            return this.userData.list;
        } else if (this.userData.userInfo != null) {
            const seriesList: Anime[] = [];
            const data = await this.traktRequest<WatchedInfo[]>('https://api.trakt.tv/users/' + this.userData.userInfo.user.ids.slug + '/watched/shows');
            for (const entry of data) {
                try {
                    for (const season of entry.seasons) {
                        const series: Anime = new Anime();
                        if (season.number == 1) {
                            series.releaseYear = entry.show.year;
                        }
                        series.names.engName = entry.show.title;
                        series.names.otherNames.push(new Name(entry.show.ids.slug, 'id'));
                        await series.names.fillNames();
                        series.seasonNumber = season.number;

                        const providerInfo: ProviderInfo = new ProviderInfo(TraktProvider.getInstance());

                        providerInfo.id = entry.show.ids.trakt;
                        providerInfo.rawEntry = entry;
                        for (let episode of season.episodes) {
                            providerInfo.addOneEpisode(episode.number, episode.last_watched_at, episode.plays);
                        }
                        providerInfo.watchStatus = WatchStatus.COMPLETED;
                        providerInfo.lastExternalChange = entry.last_watched_at;
                        series.providerInfos.push(providerInfo);
                        seriesList.push(series);
                    }
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

    public async updateEntry(anime: Anime, watchProgress: WatchProgress): Promise<ProviderInfo> {
        var providerInfo = anime.providerInfos.find(x => x.provider === this.providerName);
        if (typeof providerInfo != 'undefined') {
            providerInfo.addOneWatchProgress(watchProgress);
            const updatedEntry = await traktConverter.convertAnimeToSendEntryShow(anime, watchProgress.episode);
            await this.traktRequest('https://api.trakt.tv/sync/history', 'POST', JSON.stringify(updatedEntry));
            return providerInfo;
        }
        throw 'err';
    }

    public async removeEntry(anime: Anime, watchProgress: WatchProgress): Promise<ProviderInfo> {
        var providerInfo = anime.providerInfos.find(x => x.provider === this.providerName);
        if (typeof providerInfo != 'undefined') {
            providerInfo.removeOneWatchProgress(watchProgress);
            const updatedEntry = await traktConverter.convertAnimeToSendEntryShow(anime, watchProgress.episode);
            await this.traktRequest('https://api.trakt.tv/sync/history/remove', 'POST', JSON.stringify(updatedEntry));
            return providerInfo;
        }
        throw 'err';
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
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                console.log('body:', body); // Print the HTML for the Google homepage.
                if (body.access_token) {
                    that.userData.setTokens(body.access_token, body.refresh_token, body.expires_in);
                    that.getUserInfo();
                    resolve();
                } else {
                    reject();
                }
            });
        });
    }

    private traktRequest<T>(url: string, method = 'GET', body?: string): Promise<T> {
        const that = this;
        return new Promise<any>((resolve, reject) => {
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
                    console.log('Status:', response.statusCode);
                    if (response.statusCode === 200 || response.statusCode === 201) {
                        console.log('Headers:', JSON.stringify(response.headers));
                        console.log('Response:', body);
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
            })
        });
    }
}
