/* eslint-disable @typescript-eslint/require-await */
import { statSync } from 'fs'
import { MediaType } from '../../../controller/objects/meta/media-type'
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data'
import logger from '../../../logger/logger'
import externalInformationProvider from '../../provider/external-information-provider'
import InfoProvider from '../../provider/info-provider'
import MultiProviderResult from '../../provider/multi-provider-result'
import TMDBOfflineMetdataDownloadManager from './tmdb-offline-metadata-download-manager'
import TMDBOfflineMetdataNameSearch from './tmdb-offline-metadata-name-search'
import TMDBOnlineApi from './tmdb-online-api'
import { TMDBProviderData } from './tmdb-provider-data'

export default class TMDBProvider extends InfoProvider {
    public isOffline = true
    public hasUniqueIdForSeasons = false
    public hasEpisodeTitleOnFullInfo = true
    public supportedMediaTypes: MediaType[] = [
        MediaType.ANIME,
        MediaType.MOVIE,
        MediaType.OVA,
        MediaType.SERIES,
        MediaType.SPECIAL,
        MediaType.UNKOWN_SERIES,
    ]
    public supportedOtherProvider: (new () => externalInformationProvider)[] = []
    public potentialSubProviders: (new () => externalInformationProvider)[] = []
    public version = 1

    private providerData: TMDBProviderData
    private currentTasks: Promise<any>[] = []
    constructor() {
        super()
        this.providerData = new TMDBProviderData()
        this.providerData.loadData()
        if (this.canDownloadMetadata()) {
            this.currentTasks.push(this.downloadMetadata())
        }
    }

    public async getMoreSeriesInfoByName(searchTitle: string): Promise<MultiProviderResult[]> {
        await this.waitForTasks()
        let result: MultiProviderResult[] = []
        try {
            result = await TMDBOfflineMetdataNameSearch.search(searchTitle)
        } catch (err) {
            logger.error(err)
        }
        if (result.length == 0) {
            await this.waitUntilItCanPerfomNextRequest()
            this.informAWebRequest()
            const api = new TMDBOnlineApi(this.getApiSecret() ?? '')
            result.push(...(await api.search(searchTitle)))
        }
        return result
    }

    public async getFullInfoById(provider: ProviderLocalData): Promise<MultiProviderResult> {
        const api = new TMDBOnlineApi(this.getApiSecret() ?? '')
        return await api.getDetails(provider.id, provider.mediaType)
    }

    public getUrlToSingleEpisode(): Promise<string> {
        throw new Error('Method not implemented.')
    }

    public async isProviderAvailable(): Promise<boolean> {
        return true
    }

    private async downloadMetadata() {
        try {
            await TMDBOfflineMetdataDownloadManager.downloadOfflineMetadata()
        } catch (err) {
            logger.error(err)
        }
        this.providerData.setLastOfflineMetadataDownload()
    }

    private canDownloadMetadata() {
        const before30days = new Date(new Date().getDay() - 30)
        return (
            before30days.getTime() > statSync(TMDBOfflineMetdataDownloadManager.getSeriesFilePath()).birthtimeMs ||
            before30days.getTime() > statSync(TMDBOfflineMetdataDownloadManager.getMovieFilePath()).birthtimeMs
        )
    }

    private async waitForTasks() {
        await Promise.allSettled(this.currentTasks)
    }
}
