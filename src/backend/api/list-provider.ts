import { ListProviderLocalData } from '../controller/objects/list-provider-local-data';
import WatchProgress from '../controller/objects/meta/watch-progress';
import Series from '../controller/objects/series';
import ExternalProvider from './external-provider';
import { UserData } from './user-data';

export default interface IListProvider extends ExternalProvider {
    hasOAuthCode: boolean;
    userData: UserData;
    getAllSeries(disableCache?: boolean): Promise<Series[]>;
    logInUser(pass: string, username?: string): Promise<boolean>;
    isUserLoggedIn(): Promise<boolean>;
    getTokenAuthUrl(): string;
    updateEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData>;
    removeEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData>;
}
