import ListProvider from '../listProvider';
import { TraktUserInfo } from './objects/userInfo';
import { WatchedInfo } from './objects/watchedInfo';
import { ProviderInfo } from '../../controller/objects/providerInfo';
import Anime, { WatchStatus } from '../../controller/objects/anime';
import { TraktUserData } from './traktUserData';

import request from 'request';
import Name from '../../../backend/controller/objects/name';
export class TraktProvider implements ListProvider {

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
        const that = this;
        this.userData = new TraktUserData();
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
            const response = await this.traktRequest('https://api.trakt.tv/users/' + this.userData.userInfo.user.ids.slug + '/watched/shows');
            const data = JSON.parse(response) as WatchedInfo[];
            for (const entry of data) {
                for (const season of entry.seasons) {
                    const series: Anime = new Anime();
                    if (season.number == 1) {
                        series.releaseYear = entry.show.year;
                    }
                    series.names.engName = entry.show.title;
                    series.names.otherNames.push(new Name(entry.show.ids.slug, 'id'));
                    series.names.fillNames();
                    series.seasonNumber = season.number;

                    const providerInfo: ProviderInfo = new ProviderInfo(TraktProvider.getInstance());

                    providerInfo.id = entry.show.ids.trakt;
                    providerInfo.rawEntry = entry;
                    providerInfo.watchProgress = season.episodes.length;
                    providerInfo.watchStatus = WatchStatus.COMPLETED;
                    series.providerInfos.push(providerInfo);
                    seriesList.push(series);
                }
            }
            this.userData.updateList(seriesList);
            return seriesList;
        }
        return [];
    }

    public async getUserInfo() {
        const response = await this.traktRequest('https://api.trakt.tv/users/settings');
        const data = JSON.parse(response) as TraktUserInfo;
        this.userData.setUserData(data);
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

    private traktRequest(url: string): Promise<any> {
        const that = this;
        return new Promise<any>((resolve, reject) => {
            request({
                method: 'GET',
                url,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + that.userData.accessToken,
                    'trakt-api-version': '2',
                    'trakt-api-key': that.clientId,
                },
            }, (error: any, response: any, body: any) => {
                console.log('Status:', response.statusCode);
                console.log('Headers:', JSON.stringify(response.headers));
                console.log('Response:', body);
                resolve(body);
            });
        });
    }
}



export default TraktProvider.getInstance();
