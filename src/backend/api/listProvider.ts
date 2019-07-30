
import { UserData } from "./userData";
import Series from '../controller/objects/series';
import { ListProviderLocalData } from '../controller/objects/listProviderLocalData';
import WatchProgress from '../controller/objects/watchProgress';

export default interface ListProvider {
    providerName: string;
    hasOAuthCode: boolean;

    userData: UserData;
    getMoreSeriesInfo(a: Series): Promise<Series>;
    getAllSeries(disableCache?: boolean): Promise<Series[]>;
    logInUser(pass: string, username?: string): Promise<boolean>;
    isUserLoggedIn(): Promise<boolean>;
    getTokenAuthUrl(): string;
    updateEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData>;
    removeEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData>;

}
