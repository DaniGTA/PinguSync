import ListProvider from "../api/list-provider";

import TraktProvider from '../api/trakt/trakt-provider';
import KitsuProvider from '../api/kitsu/kitsu-provider';
import InfoProvider from '../api/info-provider';
import TVDBProvider from '../api/tvdb/tvdb-provider';
import AniListProvider from '../api/anilist/anilist-provider';
import AniDBProvider from '../api/anidb/anidb-provider';

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
