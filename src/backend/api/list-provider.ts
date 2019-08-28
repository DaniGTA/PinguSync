import Series from '../controller/objects/series';
import { ListProviderLocalData } from '../controller/objects/list-provider-local-data';
import WatchProgress from '../controller/objects/meta/watch-progress';
import { UserData } from './user-data';
import ExternalProvider from './external-provider';

export default interface ListProvider extends ExternalProvider{
    hasOAuthCode: boolean;
    userData: UserData;
    
    getAllSeries(disableCache?: boolean): Promise<Series[]>;
    logInUser(pass: string, username?: string): Promise<boolean>;
    isUserLoggedIn(): Promise<boolean>;
    getTokenAuthUrl(): string;
    updateEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData>;
    removeEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData>;
}
