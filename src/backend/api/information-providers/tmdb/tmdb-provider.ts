/* eslint-disable @typescript-eslint/require-await */
import { MediaType } from '../../../controller/objects/meta/media-type'
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

    constructor() {
        super()
        this.providerData = new TMDBProviderData()
        if (this.canDownloadMetadata()) {
            void this.downloadMetadata()
        }
    }

    public async getMoreSeriesInfoByName(searchTitle: string): Promise<MultiProviderResult[]> {
        const result = await TMDBOfflineMetdataNameSearch.search(searchTitle)
        if (result.length == 0) {
            const api = new TMDBOnlineApi(this.getApiSecret() ?? '')
            result.push(...(await api.search(searchTitle)))
        }
        return result
    }

    public getFullInfoById(): Promise<MultiProviderResult> {
        throw new Error('Method not implemented.')
    }

    public getUrlToSingleEpisode(): Promise<string> {
        throw new Error('Method not implemented.')
    }

    public async isProviderAvailable(): Promise<boolean> {
        return true
    }

    private async downloadMetadata() {
        await TMDBOfflineMetdataDownloadManager.downloadOfflineMetadata()
        this.providerData.setLastOfflineMetadataDownload()
    }

    private canDownloadMetadata() {
        const before30days = new Date(new Date().getDay() - 30)
        return (
            this.providerData.lastOfflineMetdataDownload === undefined || before30days.getTime() > new Date().getTime()
        )
    }
}
