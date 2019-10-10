import IListProvider from '../list-provider';
import { SimklUserData } from './simkl-user-data';
import Series from '../../controller/objects/series';
import WatchProgress from '../../controller/objects/meta/watch-progress';
import { ListProviderLocalData } from '../../controller/objects/list-provider-local-data';
import request from 'request';
import CodeResponse from './objects/codeResponse';
import { UserListResponse } from './objects/userListResonse';
import { MediaType } from '../../controller/objects/meta/media-type';
import MultiProviderResult from '../multi-provider-result';
import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import { SimklTextSearchResults } from './objects/simklTextSearchResults';
import SimklConverter from './simkl-converter';
import { SimklErrorResponse } from './objects/simklErrorResponse';
import { Timestamp } from 'bson';

export default class SimklProvider implements IListProvider {
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
    private timeout?: number;
    private simklConverter = new SimklConverter();
    constructor() {
        SimklProvider.instance = this;
    }

    async getMoreSeriesInfoByName(seriesName: string): Promise<MultiProviderResult[]> {
        const endResults: MultiProviderResult[] = [];
        try {
            endResults.push(...await this.animeTextSearch(seriesName));
        } catch (err) { }
        try {
            endResults.push(...await this.tvTextSearch(seriesName));
        } catch (err) { }
        try {
            endResults.push(...await this.movieTextSearch(seriesName));
        } catch (err) { }


        return endResults;
    }

    async getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult> {
        throw 'not implemented yet';
    }

    private async animeTextSearch(text: string): Promise<MultiProviderResult[]> {
        const result = await this.simklRequest<SimklTextSearchResults[]>(this.apiUrl + 'search/anime?q=' + text + '&page=1&limit=50&extended=full&client_id=' + this.clientID)
        return this.simklConverter.convertSimklTextSearchResultsToMultiProviderResults(result, MediaType.ANIME);
    }

    private async tvTextSearch(text: string): Promise<MultiProviderResult[]> {
        const result = await this.simklRequest<SimklTextSearchResults[]>(this.apiUrl + 'search/tv?q=' + text + '&page=1&limit=50&extended=full&client_id=' + this.clientID)
        return this.simklConverter.convertSimklTextSearchResultsToMultiProviderResults(result, MediaType.SERIES);
    }

    private async movieTextSearch(text: string): Promise<MultiProviderResult[]> {
        const result = await this.simklRequest<SimklTextSearchResults[]>(this.apiUrl + 'search/movie?q=' + text + '&page=1&limit=50&extended=full&client_id=' + this.clientID)
        return this.simklConverter.convertSimklTextSearchResultsToMultiProviderResults(result, MediaType.MOVIE);
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

    async isProviderAvailable(): Promise<boolean> {
        if (this.timeout && this.timeout > Date.now()) {
            return false;
        }
        return true;
    }

    private async simklRequest<T>(url: string, method = 'GET', body?: string): Promise<T> {
        if (!await this.isProviderAvailable()) {
            throw 'timeout active';
        }
        console.log('[Simkl] Start WebRequest');
        const that = this;
        return new Promise<T>((resolve, reject) => {
            try {
                request({
                    method: method,
                    url,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + that.userData.accessToken,
                    },
                    body: body,
                    timeout: 1000
                }, (error: any, response: any, body: any) => {
                    try {

                        if (response.statusCode === 200 || response.statusCode === 201) {
                            var data: T = JSON.parse(body) as T;
                            resolve(data);
                        } else if (response.statusCode === 412) {
                            var e: SimklErrorResponse = (JSON.parse(body)) as SimklErrorResponse;
                            if (e.message == 'Total Requests Limit Exceeded') {
                                const date = new Date();
                                date.setHours(date.getHours() + 24)
                                this.timeout = date.getTime();
                            }
                            reject();
                        } else {
                            console.log('[Simkl] status code:', response.statusCode);
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
