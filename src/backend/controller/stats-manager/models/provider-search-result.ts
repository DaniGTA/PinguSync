import * as mongoose from 'mongoose';
export interface IProviderSearchResult extends mongoose.Document {
    searchId: string;
    trys: number;
    results: number;
    provider: string;
    result: boolean;
    searchMediaType: string;
    searchString: string;
    searchStringType: string;
    searchStringLang: string;
    searchStringLength: number;
    searchStringSearchAbleScore: number;
    providerId?: string;

}

export const ProviderSearchResultSchema = new mongoose.Schema({
    searchId: { type: String, required: true },
    trys: { type: Number, required: true },
    results: { type: Number, required: true },
    provider: { type: String, required: true },
    result: { type: Boolean, required: true },
    searchString: { type: String, required: true },
    searchStringType: { type: String, required: true },
    searchStringLang: { type: String, required: true },
    searchMediaType: { type: String, required: true },
    searchStringLength: { type: Number, required: true },
    searchStringSearchAbleScore: { type: Number, required: true },
    providerId: { type: String },
});

export default mongoose.model<IProviderSearchResult>('ProviderSearchResult', ProviderSearchResultSchema);
