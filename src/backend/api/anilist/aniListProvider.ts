
import request from 'request';
import { Viewer } from "./graphql/viewer";
import getViewerGql from "./graphql/getViewer.gql";
import GetUserSeriesListGql from "./graphql/getUserSeriesList.gql";
import { MediaType } from "./graphql/basics/mediaType";
import { MediaListCollection, MediaRelation, Relation } from "./graphql/seriesList";
import ListProvider from "../listProvider";
import { ListProviderLocalData } from '../../controller/objects/listProviderLocalData';
import Anime, { WatchStatus } from '../../controller/objects/anime';
import searchSeriesGql from './graphql/searchSeries.gql';
import getSeriesByIDGql from './graphql/getSeriesByID.gql';
import Names from '../../../backend/controller/objects/names';
import { SearchSeries } from './graphql/searchSeries';
import titleCheckHelper from '../../../backend/helpFunctions/titleCheckHelper';
import aniListConverter from './aniListConverter';
import { GetSeriesByID } from './graphql/getSeriesByID';
import timeHelper from '../../../backend/helpFunctions/timeHelper';
import saveMediaListEntryGql from './graphql/saveMediaListEntry.gql';
import { AniListUserData } from './aniListUserData';
import { WatchProgress } from '../../../backend/controller/objects/watchProgress';

export default class AniListProvider implements ListProvider {
    providerName: string = "AniList";
    hasOAuthCode = true;
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

    public async getMoreSeriesInfo(anime: Anime): Promise<Anime> {

        var ProviderInfos = anime.listProviderInfos.find(x => x.provider === this.providerName);
        var id = null;
        if (typeof ProviderInfos != 'undefined') {
            id = ProviderInfos.id;
        } else {
            var name = await Object.assign(new Names(), anime.names).getRomajiName();
            var searchResults: SearchSeries = await this.webRequest(this.getGraphQLOptions(searchSeriesGql, { query: name, type: 'ANIME' })) as SearchSeries;
            for (const result of searchResults.Page.media) {
                try {
                    var b = await aniListConverter.convertMediaToAnime(result);
                    if (await titleCheckHelper.checkAnimeNames(anime, b)) {
                        var bProviderInfos = b.listProviderInfos.find(x => x.provider === this.providerName);
                        if (typeof bProviderInfos != 'undefined') {
                            id = bProviderInfos.id;
                        }
                    }
                } catch (err) {
                    continue;
                }
            }
        }
        if (id != null) {
            await timeHelper.delay(2500);
            var fullInfo: GetSeriesByID = await this.webRequest(this.getGraphQLOptions(getSeriesByIDGql, { id: id, type: 'ANIME' })) as GetSeriesByID;

            return await (await aniListConverter.convertExtendedInfoToAnime(fullInfo)).merge(anime);
        } else {
            throw 'NoSeriesInfoFound - AniList';
        }
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

    async getAllSeries(disableCache: boolean = false): Promise<Anime[]> {
        console.log('[Request] -> AniList -> AllSeries');
        if (this.userData.list != null && this.userData.list.length != 0 && !disableCache) {
            console.log('[LoadCache] -> AniList -> AllSeries');
            return this.userData.list;
        } else {
            var seriesList: Anime[] = [];
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

    async updateEntry(anime: Anime, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        var aniListProvider = anime.listProviderInfos.find(x => x.provider == this.providerName);
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

    public async removeEntry(anime: Anime, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        var providerInfo = anime.listProviderInfos.find(x => x.provider === this.providerName);
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
        return new Promise<T>((resolve, rejects) => {
            try {
                request(options, (error: any, response: any, body: any) => {
                    console.log('error:', error); // Print the error if one occurred
                    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
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
