
import { InfoProviderLocalData } from '../../controller/provider-manager/local-data/info-provider-local-data';
import { MediaType } from '../../controller/objects/meta/media-type';
import MultiProviderResult from './multi-provider-result';

export default abstract class ExternalProvider {
    public abstract providerName: string;
    public abstract hasUniqueIdForSeasons: boolean;
    public abstract supportedMediaTypes: MediaType[];
    public abstract version: number;

    public abstract getMoreSeriesInfoByName(searchTitle: string, season?: number): Promise<MultiProviderResult[]>;
    public abstract getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult>;
    public abstract isProviderAvailable(): Promise<boolean>;
}
