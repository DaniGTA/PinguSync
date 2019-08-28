import * as mongoose from "mongoose";
export interface IProviderSearchResult extends mongoose.Document {
    provider: string;
    result: boolean;
    searchMediaType: string;
    searchString: string;
    searchStringType: string;
    searchStringLang: string;
    searchStringLength: number;
    searchStringSearchAbleScore: number;

}

export const ProviderSearchResultSchema = new mongoose.Schema({
    provider: { type: String, required: true },
    result: { type: Boolean, required: true },
    searchString: { type: String, required: true },
    searchStringType: { type: String, required: true },
    searchStringLang: { type: String, required: true },
    searchMediaType: { type: String, required: true },
    searchStringLength: { type: Number, required: true },
    searchStringSearchAbleScore: { type: Number, required: true }
});

export default mongoose.model<IProviderSearchResult>("ProviderSearchResult", ProviderSearchResultSchema);
