import ListProvider from "../api/ListProvider";
import AniListProvider from '../api/anilist/aniListProvider';
import TraktProvider from '../api/trakt/traktProvider';
import KitsuProvider from '../api/kitsu/kitsuProvider';

export default class ProviderList {
    public static list: ListProvider[] = [
        new AniListProvider(),
        new TraktProvider(),
        new KitsuProvider()];
}
