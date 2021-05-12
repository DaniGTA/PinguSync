import ListProvider from '../../../api/provider/list-provider';
import InfoProvider from '../../../api/provider/info-provider';
import ExternalMappingProvider from '../../../api/provider/external-mapping-provider';
import logger from '../../../logger/logger';
import KitsuProvider from '../../../api/information-providers/kitsu/kitsu-provider';
import AniListProvider from '../../../api/information-providers/anilist/anilist-provider';
import TraktProvider from '../../../api/information-providers/trakt/trakt-provider';
import SimklProvider from '../../../api/information-providers/simkl/simkl-provider';
import MalProvider from '../../../api/information-providers/mal/mal-provider';
import TVMazeProvider from '../../../api/information-providers/tvmaze/tvmaze-provider';
import OMDbProvider from '../../../api/information-providers/omdb/omdb-provider';
import TVDBProvider from '../../../api/information-providers/tvdb/tvdb-provider';
import AniDBProvider from '../../../api/information-providers/anidb/anidb-provider';
import AnimeOfflineDatabaseProvider from '../../../api/mapping-providers/anime-offline-database/anime-offline-database-provider';


export default class ProviderLoader {
    protected static loadedListProvider: ListProvider[] | undefined;
    protected static loadedInfoProvider: InfoProvider[] | undefined;
    protected static loadedMappingProvider: ExternalMappingProvider[] | undefined;

    /**
     * Use private static getters that call to memoized fns lazily
     * rather than static members which are resolved during load time
     * in order to avoid circular-dependency problems.
     */
    protected listOfListProviders: Array<(new () => ListProvider)> = [KitsuProvider, AniListProvider, TraktProvider, SimklProvider, MalProvider];
    protected listOfInfoProviders: Array<(new () => InfoProvider)> = [TVMazeProvider, OMDbProvider, TVDBProvider, AniDBProvider];
    protected listOfMappingProviders: Array<(new () => ExternalMappingProvider)> = [AnimeOfflineDatabaseProvider];

    protected static loadListProviderList(): ListProvider[] {
        return this.loadProviderList(new ProviderLoader().listOfListProviders);
    }

    protected static loadInfoProviderList(): InfoProvider[] {
        return this.loadProviderList(new ProviderLoader().listOfInfoProviders);
    }

    protected static loadMappingProviderList(): ExternalMappingProvider[] {
        return this.loadProviderList(new ProviderLoader().listOfMappingProviders);
    }

    protected static loadProviderList<T>(listOfProviders: Array<(new () => T)>): T[] {
        const loadedList = [];
        for (const provider of listOfProviders) {
            try {
                loadedList.push(new provider());
            } catch (err) {
                logger.error('FAILED TO LOAD PROVIDER: ' + provider);
                logger.error(err);
            }
        }
        return loadedList;
    }
}
