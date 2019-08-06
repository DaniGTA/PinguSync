import ListProvider from "../api/ListProvider";

import TraktProvider from '../api/trakt/traktProvider';
import KitsuProvider from '../api/kitsu/kitsuProvider';
import InfoProvider from '../api/infoProvider';
import TVDBProvider from '../api/tvdb/tvdbProvider';
import AniListProvider from '../api/anilist/anilistProvider';
import AniDBNameList from '../api/anidb/anidbNameList';

export default class ProviderList {

    public static listProviderList: ListProvider[] = [
        new AniListProvider(),
        new TraktProvider(),
        new KitsuProvider()];

    public static infoProviderList: InfoProvider[] = [
        new TVDBProvider()
    ];

    public static nameListProviderList: InfoProvider[] = [
        new AniDBNameList()
    ];


}
