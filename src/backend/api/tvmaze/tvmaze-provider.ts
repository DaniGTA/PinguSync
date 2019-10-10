// tslint:disable-next-line: no-implicit-dependencies
import request from 'request';
import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import { MediaType } from '../../controller/objects/meta/media-type';
import IInfoProvider from '../info-provider';
import MultiProviderResult from '../multi-provider-result';
import { Search, Show } from './models/tvmaze-model';
import TVMazeConverter from './tvmaze-converter';

export default class TVMazeProvider implements IInfoProvider {
    public static instance: TVMazeProvider;
    public isOffline: boolean = false;
    public hasOAuthCode: boolean = false;
    public providerName: string = 'tvmaze';
    public hasUniqueIdForSeasons: boolean = false;
    public supportedMediaTypes: MediaType[] = [MediaType.SERIES, MediaType.ANIME];
    public version: number = 1;
    constructor() {
        if (!TVMazeProvider.instance) {
            TVMazeProvider.instance = this;
        }
    }
    public async isProviderAvailable(): Promise<boolean> {
        return true;
    }
    public async getMoreSeriesInfoByName(searchTitle: string, season?: number | undefined): Promise<MultiProviderResult[]> {
        const results: MultiProviderResult[] = [];
        const converter = new TVMazeConverter();
        try {
            const result = await this.webRequest<Search[]>('http://api.tvmaze.com/search/shows?q=' + encodeURI(searchTitle) + '&embed[]=episodes&embed[]=akas&embed[]=akas&embed[]=seasons');
            for (const resultEntry of result) {
                const convertedShow = converter.convertShowToResult(resultEntry.show);
                convertedShow.mainProvider.hasFullInfo = false;
                results.push(convertedShow);
            }
            return results;

        } catch (err) {
            console.log(err);
        }
        throw new Error('Test');
    }
    public async getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult> {
        const converter = new TVMazeConverter();
        const result = await this.webRequest<Show>('http://api.tvmaze.com/shows/' + provider.id + '?embed[]=episodes&embed[]=akas&embed[]=akas&embed[]=seasons');
        return converter.convertShowToResult(result);
    }


    private async webRequest<T>(url: string, method = 'GET'): Promise<T> {
        console.log('[TVMaze] Start WebRequest');
        return new Promise<any>((resolve, reject) => {
            (async () => {
                try {
                    request({
                        method: method,
                        url,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        timeout: 5000,
                    }, (error: any, response: any, body: any) => {
                        try {
                            if (response.statusCode === 200 || response.statusCode === 201) {
                                var data: T = JSON.parse(body) as T;
                                resolve(data);
                            } else {
                                console.log('[TVMaze] status code: ' + response.statusCode);
                                reject();
                            }
                        } catch (err) {
                            console.log(err);
                            reject();
                        }
                    }).on('error', (err) => {
                        console.log(err);
                        reject();
                    });
                } catch (err) {
                    console.log(err);
                    reject();
                }
            })();
        });
    }
}
