import WatchProgress from '../../controller/objects/meta/watch-progress';
import Series from '../../controller/objects/series';
import { ListProviderLocalData } from '../../controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import { UserData } from '../user-data';
import ExternalInformationProvider from './external-information-provider';
import MultiProviderResult from './multi-provider-result';
import ProviderUserList from '../../controller/objects/provider-user-list';
import Episode from '../../controller/objects/meta/episode/episode';
/**
 * List providers are able to login users and control list functions.
 */
export default abstract class ListProvider extends ExternalInformationProvider {
    /**
     * This will allow access to the function: logInUser();
     * @memberof ListProvider
     */
    public hasDefaultLogin = true;
    /**
     * This will allow access to the function: addOAuthCode();
     * @memberof ListProvider
     */
    public abstract hasOAuthLogin: boolean;
    public abstract userData: UserData;
    public abstract getAllSeries(disableCache?: boolean): Promise<MultiProviderResult[]>;
    public abstract logInUser(pass: string, username?: string): Promise<boolean>;
    public abstract addOAuthCode(code: string): Promise<boolean>;
    public abstract isUserLoggedIn(): Promise<boolean>;
    public abstract logoutUser(): void;
    public abstract getUsername(): Promise<string>;
    public abstract getTokenAuthUrl(): string;
    //depcrated
    public abstract updateEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData>;
    //depracted
    public abstract removeEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData>;
    public abstract markEpisodeAsWatched(episode: Episode): Promise<void>;
    public abstract markEpisodeAsUnwatched(episode: Episode): Promise<void>;
    public abstract getAllLists(): Promise<ProviderUserList[]>
}
