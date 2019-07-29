
import { UserData } from "./userData";
import Anime from '../controller/objects/anime';
import { ListProviderLocalData } from '../controller/objects/listProviderLocalData';
import WatchProgress from '../controller/objects/watchProgress';

export default interface ListProvider {
    providerName: string;
    hasOAuthCode: boolean;

    userData: UserData;
    getMoreSeriesInfo(a: Anime): Promise<Anime>;
    getAllSeries(disableCache?: boolean): Promise<Anime[]>;
    logInUser(pass: string, username?: string): Promise<boolean>;
    isUserLoggedIn(): Promise<boolean>;
    getTokenAuthUrl(): string;
    updateEntry(anime: Anime, watchProgress: WatchProgress): Promise<ListProviderLocalData>;
    removeEntry(anime: Anime, watchProgress: WatchProgress): Promise<ListProviderLocalData>;

}
