import WatchProgress from '../../controller/objects/meta/watch-progress';
import Series from '../../controller/objects/series';
import { ListProviderLocalData } from '../../controller/provider-manager/local-data/list-provider-local-data';
import { UserData } from '../user-data';
import ExternalInformationProvider from './external-information-provider';
import MultiProviderResult from './multi-provider-result';

export default abstract class ListProvider extends ExternalInformationProvider {
    public abstract hasOAuthCode: boolean;
    public abstract userData: UserData;
    public abstract getAllSeries(disableCache?: boolean): Promise<MultiProviderResult[]>;
    public abstract logInUser(pass: string, username?: string): Promise<boolean>;
    public abstract isUserLoggedIn(): Promise<boolean>;
    public abstract getTokenAuthUrl(): string;
    public abstract updateEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData>;
    public abstract removeEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData>;
}
