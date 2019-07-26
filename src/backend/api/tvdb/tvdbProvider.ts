import InfoProvider from '../infoProvider';
import Anime from '../../../backend/controller/objects/anime';
import { TVDBProviderData } from './tvdbProviderData';
import request from 'request';
import { TVDBLogin } from './models/login';
import { InfoProviderLocalData } from '../../controller/objects/infoProviderLocalData';
import TVDBConverter from './tvdbConverter';
import { Series } from './models/getSeries';

export default class TVDBProvider implements InfoProvider {
    public providerName = 'tvdb'
    private apiKey = '790G98VXW5MZHGV0';
    private baseUrl = 'https://api.thetvdb.com';
    private apiData: TVDBProviderData = new TVDBProviderData();
    public static Instance: TVDBProvider;
    constructor() {
        TVDBProvider.Instance = this;
    }

    public async getSeriesInfo(anime: Anime): Promise<InfoProviderLocalData> {
        const index = anime.infoProviderInfos.findIndex(entry => entry.provider == this.providerName);
        if (index != -1) {
            const series = await this.webRequest<Series>(this.baseUrl + '/series/' + anime.infoProviderInfos[index].id);
            return new TVDBConverter().convertSeriesToProviderLocalData(series);
        }
        throw 'no tvdb id';
    }

    private async getAccessKey(): Promise<string> {
        if (this.apiData.accessToken && this.apiData.expiresIn && new Date().getTime() < this.apiData.expiresIn) {
            return this.apiData.accessToken;
        } else {
            const token = await new Promise<string>((resolve, reject) => {
                request({
                    method: 'POST',
                    url: this.baseUrl + '/login',
                    headers: {},
                    body: `{
                        "apikey": "`+ this.apiKey + `
                    }`
                }, (error: any, response: any, body: TVDBLogin) => {
                    if (response.statusCode === 200 || response.statusCode === 201) {
                        resolve(body.token);
                    } else {
                        reject();
                    }
                }).on('error', (err) => {
                    console.log(err);
                    reject();
                })
            })
            const dayInms = 86400000;
            this.apiData.setTokens(token, new Date().getTime() + dayInms);
            return token;
        }
    }

    private async webRequest<T>(url: string, method = 'GET', body?: string): Promise<T> {
        return new Promise<any>(async (resolve, reject) => {
            request({
                method: method,
                url,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + await this.getAccessKey(),
                },

                body: body,
            }, (error: any, response: any, body: any) => {
                try {
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
            })
        });
    }
}
