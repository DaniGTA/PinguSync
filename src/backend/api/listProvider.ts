
import { UserData } from "./userData";
import Series from '../controller/objects/series';
import { ListProviderLocalData } from '../controller/objects/listProviderLocalData';
import WatchProgress from '../controller/objects/meta/watchProgress';

export default interface ListProvider {
    providerName: string;
    hasOAuthCode: boolean;
    hasUniqueIdForSeasons: boolean; 
    userData: UserData;

    getMoreSeriesInfoByName(series: Series,searchTitle: string): Promise<Series>;
    getAllSeries(disableCache?: boolean): Promise<Series[]>;
    logInUser(pass: string, username?: string): Promise<boolean>;
    isUserLoggedIn(): Promise<boolean>;
    getTokenAuthUrl(): string;
    updateEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData>;
    removeEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData>;
}
