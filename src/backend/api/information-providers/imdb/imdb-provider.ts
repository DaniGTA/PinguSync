import Episode from '../../../controller/objects/meta/episode/episode';
import { MediaType } from '../../../controller/objects/meta/media-type';
import providerLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import ExternalInformationProvider from '../../provider/external-information-provider';
import InfoProvider from '../../provider/info-provider';
import multiProviderResult from '../../provider/multi-provider-result';

export default class ImdbProvider extends InfoProvider {
    public isOffline = false;
    public hasUniqueIdForSeasons = false;
    public supportedMediaTypes: MediaType[] = [];
    public supportedOtherProvider: (new () => ExternalInformationProvider)[] = [];
    public potentialSubProviders: (new () => ExternalInformationProvider)[] = [];
    public version = 1;

    public getMoreSeriesInfoByName(searchTitle: string, season?: number): Promise<multiProviderResult[]> {
        throw new Error('Method not implemented.');
    }
    public getFullInfoById(provider: providerLocalData): Promise<multiProviderResult> {
        throw new Error('Method not implemented.');
    }
    public getUrlToSingleEpisode(provider: providerLocalData, episode: Episode): Promise<string> {
        throw new Error('Method not implemented.');
    }

    public async isProviderAvailable(): Promise<boolean> {
        return false;
    }
}