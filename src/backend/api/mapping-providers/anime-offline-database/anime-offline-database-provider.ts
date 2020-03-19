import { MediaType } from '../../../controller/objects/meta/media-type';
import ProviderLocalData from '../../../controller/provider-manager/local-data/interfaces/provider-local-data';
import ProviderList from '../../../controller/provider-manager/provider-list';
import AniDBProvider from '../../information-providers/anidb/anidb-provider';
import AniListProvider from '../../information-providers/anilist/anilist-provider';
import KitsuProvider from '../../information-providers/kitsu/kitsu-provider';
import MalProvider from '../../information-providers/mal/mal-provider';
import ExternalInformationProvider from '../../provider/external-information-provider';
import ExternalMappingProvider from '../../provider/external-mapping-provider';
import MultiProviderResult from '../../provider/multi-provider-result';
import AnimeOfflineDatabaseManager from './anime-offline-database-manager';
import AnimeOfflineDatabaseConverter from './anime-offline-database-converter';

export default class AnimeOfflineDatabaseProvider extends ExternalMappingProvider {
    public providerName: string = 'AnimeOfflineDatabase';
    public supportedMediaTypes: MediaType[] = [MediaType.ANIME, MediaType.OVA, MediaType.SPECIAL, MediaType.MOVIE];
    public supportedOtherProvider: Array<(new () => ExternalInformationProvider)> = [AniDBProvider, AniListProvider, KitsuProvider, MalProvider];
    public potentialSubProviders: Array<(new () => ExternalInformationProvider)> = [AniDBProvider, AniListProvider, KitsuProvider, MalProvider];

    public version: number = 1;

    public async getMappings(provider: ProviderLocalData): Promise<MultiProviderResult> {
        const providerInstance = ProviderList.getExternalProviderInstance(provider);
        const databaseEntry = AnimeOfflineDatabaseManager.getMappingFromProviderLocalData(provider);
        if (databaseEntry) {
            const result = AnimeOfflineDatabaseConverter.convertDatabaseEntryToMultiProviderResult(databaseEntry, providerInstance);
            if (result) {
                return result;
            }
        }
        throw new Error(`[AnimeOfflineDatabaseProvider] No mapping found for provider: ${provider.provider} id: ${provider.id}`);
    }

    public async isProviderAvailable(): Promise<boolean> {
        return true;
    }

}
