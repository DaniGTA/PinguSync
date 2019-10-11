import { ListProviderLocalData } from '../controller/objects/list-provider-local-data';
import WatchProgress from '../controller/objects/meta/watch-progress';
import Series from '../controller/objects/series';
import IExternalProvider from './external-provider';
import MultiProviderResult from './multi-provider-result';
import { UserData } from './user-data';

export default interface IListProvider extends IExternalProvider {
    hasOAuthCode: boolean;
    userData: UserData;
    getAllSeries(disableCache?: boolean): Promise<MultiProviderResult[]>;
    logInUser(pass: string, username?: string): Promise<boolean>;
    isUserLoggedIn(): Promise<boolean>;
    getTokenAuthUrl(): string;
    updateEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData>;
    removeEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData>;
}
