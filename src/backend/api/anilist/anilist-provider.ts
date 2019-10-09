
import request from 'request';
import { Viewer } from "./graphql/viewer";
import getViewerGql from "./graphql/getViewer.gql";
import GetUserSeriesListGql from "./graphql/getUserSeriesList.gql";
import { MediaListCollection } from "./graphql/seriesList";
import ListProvider from "../list-provider";
import { ListProviderLocalData } from '../../controller/objects/list-provider-local-data';
import Series, { WatchStatus } from '../../controller/objects/series';
import searchSeriesGql from './graphql/searchSeries.gql';
import getSeriesByIDGql from './graphql/getSeriesByID.gql';
import { SearchSeries } from './graphql/searchSeries';
import aniListConverter from './anilist-converter';
import { GetSeriesByID } from './graphql/getSeriesByID';
import saveMediaListEntryGql from './graphql/saveMediaListEntry.gql';
import { AniListUserData } from './anilist-user-data';
import WatchProgress from '../../controller/objects/meta/watch-progress';
import * as meta from '../../controller/objects/meta/media-type';
import { MediaType } from './graphql/basics/mediaType';
import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import MultiProviderResult from '../multi-provider-result';

export default class AniListProvider implements ListProvider {
    public hasUniqueIdForSeasons: boolean = true;
    public providerName: string = "AniList";
    public version = 1;
    public hasOAuthCode = true;
    public supportedMediaTypes: meta.MediaType[] = [meta.MediaType.MOVIE, meta.MediaType.ANIME, meta.MediaType.SPECIAL];
    private static instance: AniListProvider;
    userData: AniListUserData;
    private clientSecret = '5cxBi0XuQvDJHlpM5FaQqwF80bTIELuqd9MtMdZm';
    private clientId = '389';
    private redirectUri = 'https://anilist.co/api/v2/oauth/pin';

    constructor() {
        this.userData = new AniListUserData();
        AniListProvider.instance = this;
    }

    static getInstance() {
        if (!AniListProvider.instance) {
            AniListProvider.instance = new AniListProvider();
            // ... any one time initialization goes here ...
        }
        return AniListProvider.instance;
    }

    public async getMoreSeriesInfoByName(seriesName: string): Promise<MultiProviderResult[]> {
        var searchResults: SearchSeries = await this.webRequest(this.getGraphQLOptions(searchSeriesGql, { query: seriesName, type: 'ANIME' })) as SearchSeries;
        const endResult: MultiProviderResult[] = [];
        for (const result of searchResults.Page.media) {
            try {
                endResult.push(new MultiProviderResult(await aniListConverter.convertMediaToLocalData(result)));
            } catch (err) {
                continue;
            }
        }
        return endResult;
    }

    async isProviderAvailable(): Promise<boolean> {
        return true;
    }

    async getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult> {
        if (provider.provider === this.providerName && provider.id) {
            var fullInfo: GetSeriesByID = await this.webRequest(this.getGraphQLOptions(getSeriesByIDGql, { id: provider.id, type: 'ANIME' })) as GetSeriesByID;

            return new MultiProviderResult(await (await aniListConverter.convertExtendedInfoToAnime(fullInfo)));
        }
        throw 'False provider - AniList';
    }

    getTokenAuthUrl(): string {
        return 'https://anilist.co/api/v2/oauth/authorize?client_id=' + this.clientId + '&redirect_uri=' + this.redirectUri + '&response_type=code';
    }

    async isUserLoggedIn(): Promise<boolean> {
        return this.userData.access_token != "";
    }

    logInUser(code: string): Promise<boolean> {
        const _this = this;
        var options = {
            uri: 'https://anilist.co/api/v2/oauth/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            json: {
                'grant_type': 'authorization_code',
                'client_id': this.clientId,
                'client_secret': this.clientSecret,
                'redirect_uri': this.redirectUri,
                'code': code, // The Authorization Code received previously
            }
        };
        return new Promise<boolean>((resolve, reject) => {
            request(options, (error: any, response: any, body: any) => {
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                console.log('body:', body); // Print the HTML for the Google homepage.
                if (body.access_token) {
                    _this.userData.setTokens(body.access_token, body.refresh_token, body.expires_in);
                    _this.userData.created_token = new Date();
                    _this.getUserInfo();
                    resolve();
                } else {
                    reject();
                }
            });
        })
    }

    getUserInfo() {
        const _this = this;
        // Here we define our query as a multi-line string
        // Storing it in a separate .graphql/.gql file is also possible
        var query = getViewerGql;
        var options = this.getGraphQLOptions(query);
        this.webRequest<any>(options).then((value) => {
            var data = value.Viewer as Viewer;
            _this.userData.setViewer(data);
        })
    }

    async getAllSeries(disableCache: boolean = false): Promise<Series[]> {
        console.log('[Request] -> AniList -> AllSeries');
        if (this.userData.list != null && this.userData.list.length != 0 && !disableCache) {
            console.log('[LoadCache] -> AniList -> AllSeries');
            return this.userData.list;
        } else {
            var seriesList: Series[] = [];
            var data = await this.getUserSeriesList();
            for (const list of data.lists) {
                let watchStatus = await this.convertListNameToWatchStatus(list.name);
                for (const entry of list.entries) {
                    seriesList.push(await aniListConverter.convertListEntryToAnime(entry, watchStatus));
                }
            }
            this.userData.updateList(seriesList);

            return seriesList;
        }
    }

    async convertListNameToWatchStatus(name: string): Promise<WatchStatus> {
        let watchStatus = WatchStatus.CURRENT;
        switch (name) {
            case 'Planning':
                watchStatus = WatchStatus.PLANNING;
                break;
            case 'Completed':
                watchStatus = WatchStatus.COMPLETED;
                break;
            case 'Paused':
                watchStatus = WatchStatus.PAUSED;
                break;
        }
        return watchStatus;
    }

    async updateEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        var aniListProvider = anime.getListProvidersInfos().find(x => x.provider == this.providerName);
        if (typeof aniListProvider != 'undefined') {
            var watchStatus = "";
            if (watchProgress.episode == 0) {
                aniListProvider.watchStatus = WatchStatus.PLANNING;
                watchStatus = "PLANNING"
            } else if (watchProgress.episode == aniListProvider.episodes) {
                aniListProvider.watchStatus = WatchStatus.COMPLETED;
                watchStatus = "COMPLETED"
            } else {
                aniListProvider.watchStatus = WatchStatus.CURRENT;
                watchStatus = "CURRENT"
            }

            aniListProvider.addOneWatchProgress(watchProgress);

            await this.webRequest(this.getGraphQLOptions(saveMediaListEntryGql, { mediaId: aniListProvider.id, status: watchStatus, progress: watchProgress }))

            return aniListProvider;
        } else {
            throw 'err - anilist update entry';
        }
    }

    public async removeEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        var providerInfo = anime.getListProvidersInfos().find(x => x.provider === this.providerName);
        if (typeof providerInfo != 'undefined') {
            providerInfo.removeOneWatchProgress(watchProgress);
            return providerInfo;
        }
        throw 'err';
    }

    async getUserSeriesList(): Promise<MediaListCollection> {
        if (typeof this.userData.viewer != 'undefined') {
            const _this = this;
            // Here we define our query as a multi-line string
            // Storing it in a separate .graphql/.gql file is also possible
            var query = GetUserSeriesListGql;
            var variables = {
                id: this.userData.viewer.id,
                listType: MediaType.ANIME
            }
            var options = this.getGraphQLOptions(query, variables);

            return (await this.webRequest<any>(options)).MediaListCollection as MediaListCollection;
        } else {
            throw 'NoUser';
        }

    }

    private async webRequest<T>(options: (request.UriOptions & request.CoreOptions)): Promise<T> {
        console.log('[AniList] Start WebRequest');
        return new Promise<T>((resolve, rejects) => {
            try {
                request(options, (error: any, response: any, body: any) => {

                    console.log('[AniList] statusCode:', response && response.statusCode); // Print the response status code if a response was received
                    if (response.statusCode == 200) {
                        var rawdata = JSON.parse(body);
                        resolve(rawdata.data as T);
                    } else {
                        rejects();
                    }
                }).on('error', (err) => {
                    console.log(err);
                })
            } catch (err) {
                console.log(err);
            }
        })
    }

    private getGraphQLOptions(query: string, variables?: any): (request.UriOptions & request.CoreOptions) {
        var options: (request.UriOptions & request.CoreOptions) = {
            uri: 'https://graphql.anilist.co',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        };

        if (this.userData.access_token != "" && typeof this.userData.access_token != 'undefined') {
            if (typeof options.headers != 'undefined') {
                options.headers = {
                    'Authorization': 'Bearer ' + this.userData.access_token,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        }

        return options;
    }
}
