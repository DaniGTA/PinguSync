import Series from '../controller/objects/series';
import { ListProviderLocalData } from '../controller/objects/list-provider-local-data';
import WatchProgress from '../controller/objects/meta/watch-progress';
import { UserData } from './user-data';
import { MediaType } from '../controller/objects/meta/media-type';

export default interface ListProvider {
    providerName: string;
    hasOAuthCode: boolean;
    hasUniqueIdForSeasons: boolean;
    userData: UserData;
    version: number;
    supportedMediaTypes: MediaType[];

    getMoreSeriesInfoByName(series: Series, searchTitle: string): Promise<Series>;
    getAllSeries(disableCache?: boolean): Promise<Series[]>;
    logInUser(pass: string, username?: string): Promise<boolean>;
    isUserLoggedIn(): Promise<boolean>;
    getTokenAuthUrl(): string;
    updateEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData>;
    removeEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData>;
}
