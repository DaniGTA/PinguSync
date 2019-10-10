
// tslint:disable-next-line: no-implicit-dependencies
import request from 'request';
import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import { ListProviderLocalData } from '../../controller/objects/list-provider-local-data';
import * as meta from '../../controller/objects/meta/media-type';
import WatchProgress from '../../controller/objects/meta/watch-progress';
import Series, { WatchStatus } from '../../controller/objects/series';
import logger from '../../logger/logger';
import IListProvider from '../list-provider';
import MultiProviderResult from '../multi-provider-result';
import aniListConverter from './anilist-converter';
import { AniListUserData } from './anilist-user-data';
import { MediaType } from './graphql/basics/mediaType';
import { GetSeriesByID } from './graphql/getSeriesByID';
import getSeriesByIDGql from './graphql/getSeriesByID.gql';
import GetUserSeriesListGql from './graphql/getUserSeriesList.gql';
import getViewerGql from './graphql/getViewer.gql';
import saveMediaListEntryGql from './graphql/saveMediaListEntry.gql';
import { SearchSeries } from './graphql/searchSeries';
import searchSeriesGql from './graphql/searchSeries.gql';
import { MediaListCollection } from './graphql/seriesList';
import { Viewer } from './graphql/viewer';

export default class AniListProvider implements IListProvider {

    public static getInstance() {
        if (!AniListProvider.instance) {
            AniListProvider.instance = new AniListProvider();
            // ... any one time initialization goes here ...
        }
        return AniListProvider.instance;
    }
    private static instance: AniListProvider;
    public hasUniqueIdForSeasons: boolean = true;
    public providerName: string = 'AniList';
    public version = 1;
    public hasOAuthCode = true;
    public supportedMediaTypes: meta.MediaType[] = [meta.MediaType.MOVIE, meta.MediaType.ANIME, meta.MediaType.SPECIAL];
    public userData: AniListUserData;
    private clientSecret = '5cxBi0XuQvDJHlpM5FaQqwF80bTIELuqd9MtMdZm';
    private clientId = '389';
    private redirectUri = 'https://anilist.co/api/v2/oauth/pin';

    constructor() {
        this.userData = new AniListUserData();
        AniListProvider.instance = this;
    }

    public async getMoreSeriesInfoByName(seriesName: string): Promise<MultiProviderResult[]> {
        const searchResults: SearchSeries = await this.webRequest(this.getGraphQLOptions(searchSeriesGql, { query: seriesName, type: 'ANIME' })) as SearchSeries;
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

    public async isProviderAvailable(): Promise<boolean> {
        return true;
    }

    public async getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult> {
        if (provider.provider === this.providerName && provider.id) {
            const fullInfo: GetSeriesByID = await this.webRequest(this.getGraphQLOptions(getSeriesByIDGql, { id: provider.id, type: 'ANIME' })) as GetSeriesByID;

            return new MultiProviderResult(await (await aniListConverter.convertExtendedInfoToAnime(fullInfo)));
        }
        throw new Error('False provider - AniList');
    }

    public getTokenAuthUrl(): string {
        return 'https://anilist.co/api/v2/oauth/authorize?client_id=' + this.clientId + '&redirect_uri=' + this.redirectUri + '&response_type=code';
    }

    public async isUserLoggedIn(): Promise<boolean> {
        return this.userData.access_token !== '';
    }

    public logInUser(code: string): Promise<boolean> {
        const that = this;
        const options = {
            uri: 'https://anilist.co/api/v2/oauth/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            json: {
                grant_type: 'authorization_code',
                'client_id': this.clientId,
                client_secret: this.clientSecret,
                redirect_uri: this.redirectUri,
                code, // The Authorization Code received previously
            },
        };
        return new Promise<boolean>((resolve, reject) => {
            request(options, (error: any, response: any, body: any) => {
               logger.log('info', 'error:', error); // Print the error if one occurred
               logger.log('info', 'statusCode:', response && response.statusCode); // Print the response status code if a response was received
               logger.log('info', 'body:', body); // Print the HTML for the Google homepage.
               if (body.access_token) {
                    that.userData.setTokens(body.access_token, body.refresh_token, body.expires_in);
                    that.userData.created_token = new Date();
                    that.getUserInfo();
                    resolve();
                } else {
                    reject();
                }
            });
        });
    }

    public getUserInfo() {
        const _this = this;
        // Here we define our query as a multi-line string
        // Storing it in a separate .graphql/.gql file is also possible
        const query = getViewerGql;
        const options = this.getGraphQLOptions(query);
        this.webRequest<any>(options).then((value) => {
            const data = value.Viewer as Viewer;
            _this.userData.setViewer(data);
        });
    }

    public async getAllSeries(disableCache: boolean = false): Promise<Series[]> {
       logger.log('info', '[Request] -> AniList -> AllSeries');
       if (this.userData.list != null && this.userData.list.length !== 0 && !disableCache) {
           logger.log('info', '[LoadCache] -> AniList -> AllSeries');
           return this.userData.list;
        } else {
            const seriesList: Series[] = [];
            const data = await this.getUserSeriesList();
            for (const list of data.lists) {
                const watchStatus = await this.convertListNameToWatchStatus(list.name);
                for (const entry of list.entries) {
                    seriesList.push(await aniListConverter.convertListEntryToAnime(entry, watchStatus));
                }
            }
            this.userData.updateList(seriesList);

            return seriesList;
        }
    }

    public async convertListNameToWatchStatus(name: string): Promise<WatchStatus> {
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

    public async updateEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        const aniListProvider = anime.getListProvidersInfos().find((x) => x.provider === this.providerName);
        if (aniListProvider) {
            let watchStatus = '';
            if (watchProgress.episode === 0) {
                aniListProvider.watchStatus = WatchStatus.PLANNING;
                watchStatus = 'PLANNING';
            } else if (watchProgress.episode === aniListProvider.episodes) {
                aniListProvider.watchStatus = WatchStatus.COMPLETED;
                watchStatus = 'COMPLETED';
            } else {
                aniListProvider.watchStatus = WatchStatus.CURRENT;
                watchStatus = 'CURRENT';
            }

            aniListProvider.addOneWatchProgress(watchProgress);

            await this.webRequest(this.getGraphQLOptions(saveMediaListEntryGql, { mediaId: aniListProvider.id, status: watchStatus, progress: watchProgress }));

            return aniListProvider;
        } else {
            throw new Error('err - anilist update entry');
        }
    }

    public async removeEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        const providerInfo = anime.getListProvidersInfos().find((x) => x.provider === this.providerName);
        if (typeof providerInfo !== 'undefined') {
            providerInfo.removeOneWatchProgress(watchProgress);
            return providerInfo;
        }
        throw new Error('err');
    }

    public async getUserSeriesList(): Promise<MediaListCollection> {
        if (this.userData.viewer) {
            const _this = this;
            // Here we define our query as a multi-line string
            // Storing it in a separate .graphql/.gql file is also possible
            const query = GetUserSeriesListGql;
            const variables = {
                id: this.userData.viewer.id,
                listType: MediaType.ANIME,
            };
            const options = this.getGraphQLOptions(query, variables);

            return (await this.webRequest<any>(options)).MediaListCollection as MediaListCollection;
        } else {
            throw new Error('NoUser');
        }

    }

    private async webRequest<T>(options: (request.UriOptions & request.CoreOptions)): Promise<T> {
       logger.log('info', '[AniList] Start WebRequest');
       return new Promise<T>((resolve, rejects) => {
            try {
                request(options, (error: any, response: any, body: any) => {

                   logger.log('info', '[AniList] statusCode:', response && response.statusCode); // Print the response status code if a response was received
                   if (response.statusCode === 200) {
                        const rawdata = JSON.parse(body);
                        resolve(rawdata.data as T);
                    } else {
                        rejects();
                    }
                }).on('error', (err) => {
                   logger.error(err);
                });
            } catch (err) {
               logger.error(err);
            }
        });
    }

    private getGraphQLOptions(query: string, variables?: any): (request.UriOptions & request.CoreOptions) {
        const options: (request.UriOptions & request.CoreOptions) = {
            uri: 'https://graphql.anilist.co',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables,
            }),
        };

        if (this.userData.access_token !== '' && typeof this.userData.access_token !== 'undefined') {
            if (typeof options.headers !== 'undefined') {
                options.headers = {
                    'Authorization': 'Bearer ' + this.userData.access_token,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                };
            }
        }

        return options;
    }
}
