import ListProvider from '../list-provider';
import { SimklUserData } from './simkl-user-data';
import Series from 'src/backend/controller/objects/series';
import WatchProgress from 'src/backend/controller/objects/meta/watch-progress';
import { ListProviderLocalData } from 'src/backend/controller/objects/list-provider-local-data';
import request from 'request';
import CodeResponse from './objects/codeResponse';
import { UserListResponse } from './objects/userListResonse';
import { MediaType } from '../../controller/objects/meta/media-type';

export default class SimklProvider implements ListProvider {
    static instance: SimklProvider;
    userData: SimklUserData = new SimklUserData();
    public supportedMediaTypes: MediaType[] = [MediaType.ANIME, MediaType.MOVIE, MediaType.SERIES, MediaType.SPECIAL];
    public providerName = "Simkl";
    public version = 1;
    public hasOAuthCode = true;
    public hasUniqueIdForSeasons = true;

    private clientSecret = "bca301dbc53ad518f9e90abd38642a76dbd531c4d588e7e84fadd416b4ae1253";
    private clientID = "9fda12e10ec09721e9231e5323b150a77d4d095eb009097f452aafd76c3bd3d9";
    private redirectUri = "urn:ietf:wg:oauth:2.0:oob";
    private apiUrl = "https://api.simkl.com/";

    constructor() {
        SimklProvider.instance = this;
    }

    public async getMoreSeriesInfoByName(series: Series, searchTitle: string): Promise<Series> {
        throw new Error("Method not implemented.");
    }
    public async getAllSeries(disableCache?: boolean | undefined): Promise<Series[]> {
        const result = await this.simklRequest<UserListResponse>(this.apiUrl + "sync/all-items/anime/?extended=full");
        const resultList: Series[] = [];
        for (const anime of result.anime) {

        }
        for (const anime of result.movies) {

        }
        for (const anime of result.shows) {

        }
        return resultList;
    }
    public async logInUser(code: string): Promise<boolean> {
        const result = await this.simklRequest<CodeResponse>(this.apiUrl + "oauth/pin/" + code + "?client_id=" + this.clientID);
        if (result.access_token) {
            this.userData
            return true;
        }

        return false;

    }
    public async isUserLoggedIn(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    public getTokenAuthUrl(): string {
        return "https://api.simkl.com/oauth/pin?client_id=" + this.clientID + "&redirect=" + this.redirectUri
    }
    public async updateEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        throw new Error("Method not implemented.");
    }
    public async removeEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        throw new Error("Method not implemented.");
    }


    private simklRequest<T>(url: string, method = 'GET', body?: string): Promise<T> {
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
                        'trakt-api-key': that.clientID,
                    },
                    body: body,
                }, (error: any, response: any, body: any) => {
                    try {
                        console.log('[Trakt] status code:', response.statusCode);
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
        });
    }
}
