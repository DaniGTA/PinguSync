import { Document, model, Schema } from 'mongoose'
import { SeasonError } from '../../../../controller/objects/transfer/season-error'

export const ProviderMappingSchema = new Schema<ProviderMappingBaseDocument>({
    ids: [],
    episodePools: [
        {
            episodeMappings: [],
        },
    ],
})

export interface EpisodeMappingBaseDocument {
    provider: string
    providerSeriesId: number | string
    episodeNumber: number | string
    lastMappingUpdate: number
    mappingVersion: number
    providerEpisodeId?: number | string
    season?: SeasonBaseDocument
}

export interface IdsBaseDocument {
    providerId: string | number
    provider: string
}

export interface ProviderMappingBaseDocument extends Document {
    ids: IdsBaseDocument[]
    episodePools: {
        episodeMappings: EpisodeMappingBaseDocument[]
    }[]
}

export interface SeasonBaseDocument {
    seasonNumbers: Array<number | string>
    seasonPart?: number
    seasonError: SeasonError
    confirmed: boolean
}

const ProviderMappingModel = model('ProviderMapping', ProviderMappingSchema)

export default ProviderMappingModel
