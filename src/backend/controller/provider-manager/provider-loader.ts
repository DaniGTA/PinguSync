import AniDBProvider from '../../api/anidb/anidb-provider';
import AniListProvider from '../../api/anilist/anilist-provider';
import IInfoProvider from '../../api/info-provider';
import KitsuProvider from '../../api/kitsu/kitsu-provider';
import IListProvider from '../../api/list-provider';
import OMDbProvider from '../../api/omdb/omdb-provider';
import SimklProvider from '../../api/simkl/simkl-provider';
import TraktProvider from '../../api/trakt/trakt-provider';
import TVDBProvider from '../../api/tvdb/tvdb-provider';
import TVMazeProvider from '../../api/tvmaze/tvmaze-provider';

export default class ProviderLoader {
    /**
     * Use private static getters that call to memoized fns lazily
     * rather than static members which are resolved during load time
     * in order to avoid circular-dependency problems.
     */

    protected static loadedListProvider: IListProvider[] | undefined;
    protected static loadedInfoProvider: IInfoProvider[] | undefined;

    protected static loadListProviderList(): IListProvider[] {
        return [
            new KitsuProvider(),
            new AniListProvider(),
            new TraktProvider(),
            new SimklProvider(),
        ];
    }

    protected static loadInfoProviderList(): IInfoProvider[] {
        return [
            new AniDBProvider(),
            new TVMazeProvider(),
            new OMDbProvider(),
            new TVDBProvider(),
        ];
    }
}
