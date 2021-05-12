/* eslint-disable @typescript-eslint/require-await */
import { MediaType } from '../../../controller/objects/meta/media-type';
import externalInformationProvider from '../../provider/external-information-provider';
import InfoProvider from '../../provider/info-provider';
import multiProviderResult from '../../provider/multi-provider-result';

export default class SyoboiProvider extends InfoProvider {
    public isOffline = false;
    public hasUniqueIdForSeasons = false;
    public supportedMediaTypes: MediaType[] = [];
    public supportedOtherProvider: (new () => externalInformationProvider)[] = [];
    public potentialSubProviders: (new () => externalInformationProvider)[] = [];
    public version = 1;

    public getMoreSeriesInfoByName(): Promise<multiProviderResult[]> {
        throw new Error('Method not implemented.');
    }
    public getFullInfoById(): Promise<multiProviderResult> {
        throw new Error('Method not implemented.');
    }
    public getUrlToSingleEpisode(): Promise<string> {
        throw new Error('Method not implemented.');
    }

    public async isProviderAvailable(): Promise<boolean> {
        return false;
    }
}
