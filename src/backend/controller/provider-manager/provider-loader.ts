import AniDBProvider from '../../api/anidb/anidb-provider';
import AniListProvider from '../../api/anilist/anilist-provider';
import KitsuProvider from '../../api/kitsu/kitsu-provider';
import OMDbProvider from '../../api/omdb/omdb-provider';
import InfoProvider from '../../api/provider/info-provider';
import ListProvider from '../../api/provider/list-provider';
import SimklProvider from '../../api/simkl/simkl-provider';
import TraktProvider from '../../api/trakt/trakt-provider';
import TVDBProvider from '../../api/tvdb/tvdb-provider';
import TVMazeProvider from '../../api/tvmaze/tvmaze-provider';
import logger from '../../logger/logger';

export default class ProviderLoader {

    protected static loadedListProvider: ListProvider[] | undefined;
    protected static loadedInfoProvider: InfoProvider[] | undefined;

    protected static loadListProviderList(): ListProvider[] {
        return this.loadProviderList(new ProviderLoader().listOfListProviders);
    }

    protected static loadInfoProviderList(): InfoProvider[] {
        return this.loadProviderList(new ProviderLoader().listOfInfoProviders);
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
    /**
     * Use private static getters that call to memoized fns lazily
     * rather than static members which are resolved during load time
     * in order to avoid circular-dependency problems.
     */
    protected listOfListProviders: Array<(new () => ListProvider)> = [KitsuProvider, AniListProvider, TraktProvider, SimklProvider];
    protected listOfInfoProviders: Array<(new () => InfoProvider)> = [TVMazeProvider, OMDbProvider, TVDBProvider, AniDBProvider];
}
