import EpisodeBindingPool from '../../../controller/objects/meta/episode/episode-binding-pool';
import { MediaType } from '../../../controller/objects/meta/media-type';
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import AniDBProvider from '../../information-providers/anidb/anidb-provider';
import TVDBProvider from '../../information-providers/tvdb/tvdb-provider';
import ExternalInformationProvider from '../../provider/external-information-provider';
import ExternalMappingProvider from '../../provider/external-mapping-provider';
import MultiProviderResult from '../../provider/multi-provider-result';

export default class ScudLeeAnimeListProvider extends ExternalMappingProvider {

    providerName = 'ScudLeeAnimeListProvider';

    public supportedMediaTypes: MediaType[] = [MediaType.ANIME, MediaType.OVA, MediaType.SPECIAL, MediaType.MOVIE];
    public supportedOtherProvider: Array<(new () => ExternalInformationProvider)> = [AniDBProvider, TVDBProvider];
    public potentialSubProviders: Array<(new () => ExternalInformationProvider)> = [AniDBProvider, TVDBProvider];

    public version = 1;

    public async getSeriesMappings(provider: ProviderLocalData): Promise<MultiProviderResult[]> {
        const result: MultiProviderResult[] = [];

        return result;
    }

    public async getEpisodeMappings(provider: ProviderLocalData): Promise<EpisodeBindingPool[]> {
        const mappings: EpisodeBindingPool[] = [];

        return mappings;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async isProviderAvailable(): Promise<boolean> {
        return true;
    }
}