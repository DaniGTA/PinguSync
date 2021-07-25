import { Method } from 'got/dist/source'
import Episode from '../../../controller/objects/meta/episode/episode'
// tslint:disable-next-line: no-implicit-dependencies
import { MediaType } from '../../../controller/objects/meta/media-type'

import { InfoProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/info-provider-local-data'
import { ProviderInfoStatus } from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status'
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data'
import RequestBundle from '../../../controller/web-request-manager/request-bundle'
import WebRequestManager from '../../../controller/web-request-manager/web-request-manager'
import logger from '../../../logger/logger'
import ExternalInformationProvider from '../../provider/external-information-provider'
import InfoProvider from '../../provider/info-provider'
import MultiProviderResult from '../../provider/multi-provider-result'
import { Search, Show } from './models/tvmaze-model'
import TVMazeConverter from './tvmaze-converter'

export default class TVMazeProvider extends InfoProvider {
    public static instance: TVMazeProvider
    public isOffline = false
    public hasOAuthCode = false
    public hasUniqueIdForSeasons = false
    public supportedMediaTypes: MediaType[] = [MediaType.SERIES, MediaType.ANIME]
    public supportedOtherProvider: Array<new () => ExternalInformationProvider> = []
    public potentialSubProviders: Array<new () => ExternalInformationProvider> = []
    public version = 1
    constructor() {
        super()
        if (!TVMazeProvider.instance) {
            TVMazeProvider.instance = this
        }
    }

    public async getUrlToSingleEpisode(provider: ProviderLocalData, episode: Episode): Promise<string> {
        return ''
    }

    public async isProviderAvailable(): Promise<boolean> {
        return true
    }
    public async getMoreSeriesInfoByName(
        searchTitle: string,
        season?: number | undefined
    ): Promise<MultiProviderResult[]> {
        const results: MultiProviderResult[] = []
        const converter = new TVMazeConverter()
        try {
            searchTitle = searchTitle.replace('&', 'and')
            const result = await this.webRequest<Search[]>(
                'http://api.tvmaze.com/search/shows?q=' +
                    encodeURI(searchTitle) +
                    '&embed[]=episodes&embed[]=akas&embed[]=akas&embed[]=seasons'
            )
            for (const resultEntry of result) {
                const convertedShow = converter.convertShowToResult(resultEntry.show)
                convertedShow.mainProvider.providerLocalData.infoStatus = ProviderInfoStatus.BASIC_INFO
                results.push(convertedShow)
            }
            return results
        } catch (err) {
            logger.info(err)
        }
        throw new Error('Test')
    }
    public async getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult> {
        const converter = new TVMazeConverter()
        const result = await this.webRequest<Show>(
            `http://api.tvmaze.com/shows/${provider.id}?embed[]=episodes&embed[]=akas&embed[]=akas&embed[]=seasons`
        )
        return converter.convertShowToResult(result)
    }

    private async webRequest<T>(url: string, method: Method = 'GET'): Promise<T> {
        this.informAWebRequest()
        logger.info('[TVMaze] Start WebRequest')
        const response = await WebRequestManager.request<string>(
            new RequestBundle(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 5000,
            })
        )
        if (response.statusCode === 200 || response.statusCode === 201) {
            return JSON.parse(response.body) as T
        } else {
            logger.info(`[TVMaze] status code: ${response.statusCode}`)
            throw new Error(`[TVMaze] status code: ${response.statusCode}`)
        }
    }
}
