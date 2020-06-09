
// tslint:disable-next-line: no-implicit-dependencies
import request from 'request';
import * as meta from '../../../controller/objects/meta/media-type';
import WatchProgress from '../../../controller/objects/meta/watch-progress';
import Series from '../../../controller/objects/series';
import { InfoProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import WebRequestManager from '../../../controller/web-request-manager/web-request-manager';
import timeHelper from '../../../helpFunctions/time-helper';
import logger from '../../../logger/logger';
import ExternalInformationProvider from '../../provider/external-information-provider';
import ListProvider from '../../provider/list-provider';
import MultiProviderResult from '../../provider/multi-provider-result';
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
import { IViewer } from './graphql/viewer';
import ProviderUserList from '../../../controller/objects/provider-user-list';
import getUserSeriesListInfoGql from './graphql/getUserSeriesListInfo.gql';
import { GetUserSeriesListInfo } from './graphql/getUserSeriesList';
import { ListType } from '../../../controller/settings/models/provider/list-types';

export default class AniListProvider extends ListProvider {
    public async getAllLists(): Promise<ProviderUserList[]> {
        const rawdata = await this.webRequest<GetUserSeriesListInfo>(this.getGraphQLOptions(getUserSeriesListInfoGql, { id: this.userData.viewer?.id, listType: 'ANIME' }));
        return aniListConverter.convertUserSeriesListToProviderList(rawdata);
    }

    public getUsername(): Promise<string> {
        throw new Error('Method not implemented.');
    }
    public logoutUser(): void {
        this.userData.setTokens('', '', 0);
    }

    public static getInstance(): AniListProvider {
        if (!AniListProvider.instance) {
            AniListProvider.instance = new AniListProvider();
            // ... any one time initialization goes here ...
        }
        return AniListProvider.instance;
    }
    private static instance: AniListProvider;
    public hasUniqueIdForSeasons = true;
    public providerName = 'AniList';
    public version = 1;
    public hasOAuthLogin = true;
    public hasDefaultLogin = false;
    public supportOnlyBasicLatinForNameSearch = false;
    public supportedMediaTypes: meta.MediaType[] = [meta.MediaType.MOVIE, meta.MediaType.ANIME, meta.MediaType.SPECIAL];
    public supportedOtherProvider: Array<(new () => ExternalInformationProvider)> = [];
    public potentialSubProviders: Array<(new () => ExternalInformationProvider)> = [];
    public userData: AniListUserData;
    private redirectUri = 'http://localhost:3000/callback';

    constructor() {
        super();

        if (AniListProvider.instance) {
            this.userData = AniListProvider.instance.userData;
        } else {
            AniListProvider.instance = this;
            this.userData = new AniListUserData();
        }
    }

    public async markEpisodeAsUnwatched(episode: Episode): Promise<void> {

    }

    public async markEpisodeAsWatched(episode: Episode): Promise<void> {

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
                code, // The Authorization Code received previously
                // eslint-disable-next-line @typescript-eslint/camelcase
                grant_type: 'authorization_code',
                // eslint-disable-next-line @typescript-eslint/camelcase
                redirect_uri: this.redirectUri,
            },
            method: 'POST',
            uri: 'https://anilist.co/api/v2/oauth/token',
        };

        const body = await this.webRequest<any>(options);

        if (body.access_token) {
            this.userData.setTokens(body.access_token, body.refresh_token, body.expires_in);
            this.userData.createdToken = new Date();
            this.getUserInfo();
            return true;
        } else {
            throw new Error();
        }
    }

    public async getMoreSeriesInfoByName(seriesName: string): Promise<MultiProviderResult[]> {
        const searchResults: SearchSeries = await this.webRequest(this.getGraphQLOptions(searchSeriesGql, { query: seriesName, type: 'ANIME' }));
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
            const fullInfo: GetSeriesByID = await this.webRequest(this.getGraphQLOptions(getSeriesByIDGql, { id: provider.id, type: 'ANIME' }));

            return new MultiProviderResult(await aniListConverter.convertExtendedInfoToAnime(fullInfo));
        }
        throw new Error('False provider - AniList');
    }

    public getTokenAuthUrl(): string {
        return 'https://anilist.co/api/v2/oauth/authorize?client_id=' + this.getApiId() + '&redirect_uri=' + this.redirectUri + '&response_type=code';
    }

    public async isUserLoggedIn(): Promise<boolean> {
        return this.userData.access_token !== '';
    }

    public logInUser(): Promise<boolean> {
        throw new Error('Default login not support by AniList');
    }

    public getUserInfo(): void {
        this.informAWebRequest();
        // Here we define our query as a multi-line string
        // Storing it in a separate .graphql/.gql file is also possible
        const query = getViewerGql;
        const options = this.getGraphQLOptions(query);
        this.webRequest<any>(options).then((value) => {
            const data = value.Viewer as IViewer;
            this.userData.setViewer(data);
        });
    }

    public async getAllSeries(disableCache = false): Promise<MultiProviderResult[]> {
        logger.log('info', '[Request] -> AniList -> AllSeries');
        if (this.userData.list != null && this.userData.list.length !== 0 && !disableCache) {
            logger.log('info', '[LoadCache] -> AniList -> AllSeries');
            return this.userData.list;
        } else {
            const seriesList: MultiProviderResult[] = [];
            const data = await this.getUserSeriesList();
            for (const list of data.lists) {
                const watchStatus = this.convertListNameToWatchStatus(list.name);
                for (const entry of list.entries) {
                    seriesList.push(await aniListConverter.convertListEntryToAnime(entry, watchStatus));
                }
            }
            this.userData.updateList(seriesList);

            return seriesList;
        }
    }

    public convertListNameToWatchStatus(name: string): ListType {
        let watchStatus = ListType.CURRENT;
        switch (name) {
            case 'Planning':
                watchStatus = ListType.PLANNING;
                break;
            case 'Completed':
                watchStatus = ListType.COMPLETED;
                break;
            case 'Paused':
                watchStatus = ListType.PAUSED;
                break;
        }
        return watchStatus;
    }

    public async updateEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        const aniListProvider = anime.getListProvidersInfos().find((x) => x.provider === this.providerName);
        if (aniListProvider) {
            let watchStatus = '';
            if (watchProgress.episode === 0) {
                aniListProvider.watchStatus = ListType.PLANNING;
                watchStatus = 'PLANNING';
            } else if (watchProgress.episode === aniListProvider.episodes) {
                aniListProvider.watchStatus = ListType.COMPLETED;
                watchStatus = 'COMPLETED';
            } else {
                aniListProvider.watchStatus = ListType.CURRENT;
                watchStatus = 'CURRENT';
            }
            await this.webRequest(this.getGraphQLOptions(saveMediaListEntryGql, { mediaId: aniListProvider.id, status: watchStatus, progress: watchProgress }));

            return aniListProvider;
        } else {
            throw new Error('err - anilist update entry');
        }
    }

    public async removeEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        const providerInfo = anime.getListProvidersInfos().find((x) => x.provider === this.providerName);
        if (typeof providerInfo !== 'undefined') {
            return providerInfo;
        }
        throw new Error('err');
    }

    public async getUserSeriesList(): Promise<MediaListCollection> {
        if (this.userData.viewer) {
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
        this.informAWebRequest();

        logger.log('info', '[AniList] Start WebRequest');

        const response = await WebRequestManager.request(options);

        logger.log('info', '[AniList] statusCode: {0}', response && response.statusCode); // Print the response status code if a response was received
        if (response.statusCode === 200) {
            try {
                const rawdata = JSON.parse(response.body);
                return rawdata.data as T;
            } catch (err) {
                return response.body as T;
            }
        } else if (response.statusCode === 429) {
            timeHelper.delay(2000);
            return this.webRequest(options);
        } else {
            throw new Error('Wrong Status Code: ' + response.statusCode);

        }

    }

    private getGraphQLOptions(query: string, variables?: any): (request.UriOptions & request.CoreOptions) {
        const options: (request.UriOptions & request.CoreOptions) = {
            body: JSON.stringify({
                query,
                variables,
            }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'POST',
            uri: 'https://graphql.anilist.co',
        };

        if (this.userData.access_token !== '' && typeof this.userData.access_token !== 'undefined') {
            if (typeof options.headers !== 'undefined') {
                options.headers = {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + this.userData.access_token,
                    'Content-Type': 'application/json',
                };
            }
        }

        return options;
    }
}
