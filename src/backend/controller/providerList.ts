import ListProvider from "../api/ListProvider";

import TraktProvider from '../api/trakt/traktProvider';
import KitsuProvider from '../api/kitsu/kitsuProvider';
import InfoProvider from '../api/infoProvider';
import TVDBProvider from '../api/tvdb/tvdbProvider';
import AniListProvider from '../api/anilist/aniListProvider';
import AniDBProvider  from '../api/anidb/anidb-provider';

export default class ProviderList {

    public static listProviderList: ListProvider[] = [
        new AniListProvider(),
        new TraktProvider(),
        new KitsuProvider()];

    public static infoProviderList: InfoProvider[] = [
        new AniDBProvider(),
        new TVDBProvider()
    ];
}
