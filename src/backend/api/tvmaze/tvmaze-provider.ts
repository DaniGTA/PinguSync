// tslint:disable-next-line: no-implicit-dependencies
import request from 'request';
import { InfoProviderLocalData } from '../../controller/provider-manager/local-data/info-provider-local-data';
import { MediaType } from '../../controller/objects/meta/media-type';
import logger from '../../logger/logger';
import InfoProvider from '../provider/info-provider';
import MultiProviderResult from '../provider/multi-provider-result';
import { Search, Show } from './models/tvmaze-model';
import TVMazeConverter from './tvmaze-converter';
import ExternalProvider from '../provider/external-provider';

export default class TVMazeProvider extends InfoProvider {
    public static instance: TVMazeProvider;
    public isOffline: boolean = false;
    public hasOAuthCode: boolean = false;
    public providerName: string = 'tvmaze';
    public hasUniqueIdForSeasons: boolean = false;
    public supportedMediaTypes: MediaType[] = [MediaType.SERIES, MediaType.ANIME];
    public supportedOtherProvider: Array<(new () => ExternalProvider)> = [];
    public version: number = 1;
    constructor() {
        super();
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
            logger.log('info', err);
        }
        throw new Error('Test');
    }
    public async getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult> {
        const converter = new TVMazeConverter();
        const result = await this.webRequest<Show>('http://api.tvmaze.com/shows/' + provider.id + '?embed[]=episodes&embed[]=akas&embed[]=akas&embed[]=seasons');
        return converter.convertShowToResult(result);
    }


    private async webRequest<T>(url: string, method = 'GET'): Promise<T> {
        logger.log('info', '[TVMaze] Start WebRequest');
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
                                logger.log('info', '[TVMaze] status code: ' + response.statusCode);
                                reject();
                            }
                        } catch (err) {
                            logger.error(err);
                            reject();
                        }
                    }).on('error', (err) => {
                        logger.error(err);
                        reject();
                    });
                } catch (err) {
                    logger.error(err);
                    reject();
                }
            })();
        });
    }
}
