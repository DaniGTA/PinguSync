import { InfoProviderLocalData } from '../controller/objects/info-provider-local-data';
import { MediaType } from '../controller/objects/meta/media-type';
import MultiProviderResult from './multi-provider-result';

export default interface ExternalProvider {
    providerName: string;
    hasUniqueIdForSeasons: boolean;
    supportedMediaTypes: MediaType[];
    version: number;

    getMoreSeriesInfoByName(searchTitle: string, season?: number): Promise<MultiProviderResult[]>;
    getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult>;
}
