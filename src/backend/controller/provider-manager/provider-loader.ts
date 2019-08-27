import ListProvider from "../../api/list-provider";
import AniListProvider from '../../api/anilist/anilist-provider';
import TraktProvider from '../../api/trakt/trakt-provider';
import KitsuProvider from '../../api/kitsu/kitsu-provider';
import InfoProvider from '../../api/info-provider';
import AniDBProvider from '../../api/anidb/anidb-provider';
import TVDBProvider from '../../api/tvdb/tvdb-provider';

export default class ProviderLoader {
    /**
     * Use private static getters that call to memoized fns lazily
        rather than static members which are resolved during load time
        in order to avoid circular-dependency problems.
     */

    protected static loadedListProvider: ListProvider[] | undefined;
    protected static loadedInfoProvider: InfoProvider[] | undefined;

    protected static loadListProviderList(): ListProvider[] {
        return [
            new AniListProvider(),
            new TraktProvider(),
            new KitsuProvider()
        ];
    }

    protected static loadInfoProviderList(): InfoProvider[] {
        return [
            new AniDBProvider(),
            new TVDBProvider()
        ];
    }
}