import electron from 'electron';
import * as fs from "fs";
import * as path from "path";
import request from 'request';
import { Viewer } from "./graphql/viewer";
import getViewerGql from "./graphql/getViewer.gql";
import GetUserSeriesListGql from "./graphql/getUserSeriesList.gql";
import { MediaType } from "./graphql/basics/mediaType";
import { MediaListCollection } from "./graphql/seriesList";
import ListProvider from "../listProvider";
import { UserData } from "../userData";
import { ProviderInfo } from '../../controller/objects/providerInfo';
import Anime, { WatchStatus } from '../../controller/objects/anime';

export class AniListProvider implements ListProvider {
    providerName: string = "AniList";
    hasOAuthCode = true;
    private static instance: AniListProvider;
    userData: AniListUserData;
    private clientSecret = '5cxBi0XuQvDJHlpM5FaQqwF80bTIELuqd9MtMdZm';
    private clientId = '389';
    private redirectUri = 'https://anilist.co/api/v2/oauth/pin';
    constructor() {
        this.userData = new AniListUserData();
        const _this = this;
    }

    static getInstance() {
        if (!AniListProvider.instance) {
            AniListProvider.instance = new AniListProvider();
            // ... any one time initialization goes here ...
        }
        return AniListProvider.instance;
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

        request(options, (error: any, response: any, body: any) => {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body);
            var data = JSON.parse(body).data.Viewer as Viewer;
            _this.userData.setViewer(data);
        });

    }

    async getAllSeries(): Promise<Anime[]> {
        console.log('[Request] -> AniList -> AllSeries');
        if (this.userData.list != null && this.userData.list.length == 0) {
            console.log('[LoadCache] -> AniList -> AllSeries');
            return this.userData.list;
        } else {
            var seriesList: Anime[] = [];
            var data = await this.getUserSeriesList();
            for (const list of data.lists) {
                for (const entry of list.entries) {
                    var series: Anime = new Anime();
                    series.names.engName = entry.media.title.english;
                    series.names.mainName = entry.media.title.native;
                    series.names.romajiName = entry.media.title.romaji;
                    if (typeof entry.media.episodes != 'undefined') {
                        series.episodes = entry.media.episodes;
                    }
                    series.releaseYear = entry.media.startDate.year;
                    series.seasonNumber = await series.names.getSeasonNumber();
                    var providerInfo: ProviderInfo = new ProviderInfo(AniListProvider.getInstance());

                    providerInfo.id = entry.media.id;
                    providerInfo.score = entry.score;
                    providerInfo.rawEntry = entry;
                    providerInfo.watchProgress = entry.progress;

                    series.providerInfos.push(providerInfo);
                    seriesList.push(series);
                }
            }
            this.userData.updateList(seriesList);

            return seriesList;
        }
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

            return new Promise<MediaListCollection>((resolve, rejects) => {
                request(options, function (error: any, response: any, body: any) {
                    console.log('error:', error); // Print the error if one occurred
                    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                    console.log('body:', body);
                    if (response.statusCode == 200) {
                        var rawdata = JSON.parse(body);
                        resolve(rawdata.data.MediaListCollection as MediaListCollection);
                    } else {
                        rejects();
                    }

                });
            })
        } else {
            throw 'NoUser';
        }

    }

    private getGraphQLOptions(query: string, variables?: any): (request.UriOptions & request.CoreOptions) {
        var options: (request.UriOptions & request.CoreOptions) = {
            uri: 'https://graphql.anilist.co',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + this.userData.access_token,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        };
        return options;
    }
}
class AniListUserData implements UserData {
    username: string = '';
    access_token: string = "";
    refresh_token: string = "";
    expires_in: number = 0;
    viewer: Viewer | undefined;
    list: Anime[] | undefined;
    lastListUpdate: Date | undefined;

    constructor() {
        this.loadData();
    }

    updateList(list: Anime[]) {
        this.list = list;
        this.lastListUpdate = new Date(Date.now());
        this.saveData();
    }

    setViewer(viewer: Viewer) {
        this.viewer = viewer;
        this.username = viewer.name;
        this.saveData();
    }

    setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
        this.access_token = accessToken;
        this.refresh_token = refreshToken;
        this.expires_in = expiresIn;
        this.saveData();
    }



    private saveData() {
        console.log('[Save] -> AniList -> UserData');
        fs.writeFileSync(this.getPath(), JSON.stringify(this));
    }

    private loadData() {
        try {
            if (fs.existsSync(this.getPath())) {
                var loadedString = fs.readFileSync(this.getPath(), "UTF-8");
                var loadedData = JSON.parse(loadedString) as this;
                this.viewer = loadedData.viewer;
                this.access_token = loadedData.access_token;
                this.expires_in = loadedData.expires_in;
                this.refresh_token = loadedData.refresh_token;
                this.username = loadedData.username;
                this.list = loadedData.list;
                this.lastListUpdate = loadedData.lastListUpdate;
            }
        } catch (err) {

        }
    }

    private getPath(): string {
        const userDataPath = (electron.app || electron.remote.app).getPath('userData');
        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        return path.join(userDataPath, 'anilist_config.json');
    }
}


export default AniListProvider.getInstance();