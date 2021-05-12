import Episode from '../../../controller/objects/meta/episode/episode'
import EpisodeMapping from '../../../controller/objects/meta/episode/episode-mapping'
import { MediaType } from '../../../controller/objects/meta/media-type'
import Season from '../../../controller/objects/meta/season'
import Series from '../../../controller/objects/series'
import { InfoProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/info-provider-local-data'
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data'
import { ListProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/list-provider-local-data'
import ProviderList from '../../../controller/provider-controller/provider-manager/provider-list'
import ExternalInformationProvider from '../../provider/external-information-provider'
import ExternalMappingProvider from '../../provider/external-mapping-provider'
import InfoProvider from '../../provider/info-provider'
import ListProvider from '../../provider/list-provider'
import MultiProviderResult from '../../provider/multi-provider-result'
import EpisodeBindingPool from '../../../controller/objects/meta/episode/episode-binding-pool'
import ProviderMappingModel, {
    EpisodeMappingBaseDocument,
    IdsBaseDocument,
    ProviderMappingBaseDocument,
    ProviderMappingSchema,
} from './objects/provider-mapping-model'
import * as mongoose from 'mongoose'
import logger from '../../../logger/logger'
import { MappingProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/mapping-provider-local-data'
import AniDBProvider from '../../information-providers/anidb/anidb-provider'
import AniListProvider from '../../information-providers/anilist/anilist-provider'
import KitsuProvider from '../../information-providers/kitsu/kitsu-provider'
import MalProvider from '../../information-providers/mal/mal-provider'
import TraktProvider from '../../information-providers/trakt/trakt-provider'

export default class PinguSyncMappingProvider extends ExternalMappingProvider {
    public supportedMediaTypes: MediaType[] = []
    public supportedOtherProvider: Array<new () => ExternalInformationProvider> = [
        AniDBProvider,
        AniListProvider,
        KitsuProvider,
        MalProvider,
        TraktProvider,
    ]
    public potentialSubProviders: Array<new () => ExternalInformationProvider> = [
        AniDBProvider,
        AniListProvider,
        KitsuProvider,
        MalProvider,
        TraktProvider,
    ]
    public version = 1

    private mongoDB: mongoose.Connection | null = null

    constructor() {
        super()
        this.connect()
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async isProviderAvailable(): Promise<boolean> {
        return true
    }

    public async getSeriesMappings(provider: ProviderLocalData): Promise<MultiProviderResult[]> {
        const result: MultiProviderResult[] = []
        try {
            const mappings = await this.getProviderWithoutEpisodeMapping(provider.id, provider.provider)
            for (const entry of mappings) {
                const localDatas = []
                for (const providerId of entry.ids) {
                    const providerInstance = ProviderList.getProviderInstanceByProviderName(providerId.provider)
                    if (providerInstance instanceof ListProvider) {
                        localDatas.push(new ListProviderLocalData(providerId.providerId, providerInstance))
                    } else if (providerInstance instanceof InfoProvider) {
                        localDatas.push(new InfoProviderLocalData(providerId.providerId, providerInstance))
                    }
                }
                const mainProviderIndex = localDatas.findIndex(
                    x => x.provider === provider.provider && provider.id == x.id
                )
                if (mainProviderIndex > -1) {
                    const mainProvider = localDatas[mainProviderIndex]
                    localDatas.splice(mainProviderIndex, 1)
                    localDatas.push(new MappingProviderLocalData(entry.id, this))
                    result.push(new MultiProviderResult(mainProvider, ...localDatas))
                }
            }
        } catch (err) {
            throw new Error(err)
        }
        return result
    }

    public async getEpisodeMappings(provider: ProviderLocalData): Promise<EpisodeBindingPool[]> {
        const mappings: EpisodeBindingPool[] = []
        const result = await this.getProviderWithEpisodeMapping(provider.id, provider.provider)
        for (const entry of result) {
            for (const poolMapping of entry.episodePools) {
                const pool: EpisodeBindingPool = new EpisodeBindingPool()
                for (const epMappings of poolMapping.episodeMappings) {
                    pool.addEpisodeMappingToBindings(this.convertEpisodeMapping(epMappings, provider))
                }
                mappings.push(pool)
            }
        }
        return mappings
    }

    public async getProviderWithoutEpisodeMapping(
        id: number | string,
        provider: string
    ): Promise<ProviderMappingBaseDocument[]> {
        const ProviderMappingModelDB =
            this.mongoDB?.model('ProviderMapping', ProviderMappingSchema) ?? ProviderMappingModel
        return await ProviderMappingModelDB.find({ Ids: { providerId: id, provider: provider } }).exec()
    }

    public async getProviderWithEpisodeMapping(
        id: number | string,
        provider: string
    ): Promise<ProviderMappingBaseDocument[]> {
        const ProviderMappingModelDB =
            this.mongoDB?.model('ProviderMapping', ProviderMappingSchema) ?? ProviderMappingModel
        return await ProviderMappingModelDB?.find({ Ids: { providerId: id, provider: provider } }).exec()
    }

    public async saveSeries(series: Series): Promise<MappingProviderLocalData | undefined> {
        const ids: IdsBaseDocument[] = []
        for (const provider of series.getAllProviderBindings()) {
            ids.push({ provider: provider.providerName, providerId: provider.id })
        }
        const episodePools: any[] = []
        for (const episodeMappingPool of series.episodeBindingPools) {
            const pool: EpisodeMappingBaseDocument[] = []
            for (const singleEpisodeMapping of episodeMappingPool.bindedEpisodeMappings) {
                const epMapping = {
                    episodeNumber: singleEpisodeMapping.episodeNumber,
                    mappingVersion: singleEpisodeMapping.mappingVersion,
                    lastMappingUpdate: singleEpisodeMapping.lastMappingUpdate,
                    provider: singleEpisodeMapping.provider,
                    providerSeriesId: singleEpisodeMapping.providerSeriesId,
                    providerEpisodeId: singleEpisodeMapping.providerEpisodeId,
                    season: singleEpisodeMapping.season,
                }
                pool.push(epMapping)
            }
            episodePools.push({ episodeMappings: pool })
        }

        const providerMappingDocument = {
            ids,
            episodePools,
        }
        console.log('test3')
        const ProviderMappingModelDB =
            this.mongoDB?.model('ProviderMapping', ProviderMappingSchema) ?? ProviderMappingModel
        let dbDocument
        const localData = series.getOneProviderLocalDataByProviderName(this.providerName)
        if (localData) {
            //ProviderMappingModelDB.findByIdAndUpdate(localData.id, dbDocument)
        } else {
            dbDocument = await ProviderMappingModelDB?.create(providerMappingDocument)
        }
        return dbDocument ? new MappingProviderLocalData(dbDocument.id, this) : undefined
    }

    private convertEpisodeMapping(episdoeMapping: any, provider: ProviderLocalData): EpisodeMapping {
        let season
        if (episdoeMapping.season) {
            season = new Season(
                episdoeMapping.season.seasonNumbers,
                episdoeMapping.season.seasonPart,
                episdoeMapping.season.seasonError
            )
            season.confirmed = episdoeMapping.season.confirmed
        }
        const episode = new Episode(episdoeMapping.episodeNumber, season)
        const epMappingResult = new EpisodeMapping(episode, provider)
        return epMappingResult
    }

    private async connect(): Promise<void> {
        //const uri = 'mongodb+srv://PinguSync:3b86syFYVCkYZoup@cluster0.eleme.mongodb.net/PinguSync?retryWrites=true&w=majority';
        const uri =
            'mongodb+srv://PinguSyncAdmin:ksF27QkRSkZ5gch6@cluster0.eleme.mongodb.net/PinguSync?retryWrites=true&w=majority'
        try {
            this.mongoDB = await mongoose.createConnection(uri, {
                useNewUrlParser: true,
                autoReconnect: false,
                maxIdleTimeMS: 1000,
                useUnifiedTopology: true,
            })
        } catch (err) {
            logger.error(err)
        }
    }
}
