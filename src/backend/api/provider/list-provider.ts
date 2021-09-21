import WatchProgress from '../../controller/objects/meta/watch-progress'
import Series from '../../controller/objects/series'
import { ListProviderLocalData } from '../../controller/provider-controller/provider-manager/local-data/list-provider-local-data'
import { UserData } from '../user-data'
import ExternalInformationProvider from './external-information-provider'
import MultiProviderResult from './multi-provider-result'
import ProviderUserList from '../../controller/objects/provider-user-list'
import Episode from '../../controller/objects/meta/episode/episode'
/**
 * List providers are able to login users and control list functions.
 */
export default abstract class ListProvider extends ExternalInformationProvider {
    /**
     * This will allow access to the function: logInUser();
     * @memberof ListProvider
     */
    public hasDefaultLogin = true
    /**
     * Use @link OAuthListProvider to use OAuthLogin
     * @memberof ListProvider
     */
    public hasOAuthLogin = false

    /**
     * Simple user data container to save user information like token, username, userimage ...
     *
     * @abstract
     * @type {UserData}
     * @memberof ListProvider
     */

    public abstract userData: UserData

    /**
     * Returns `false` if the provider is not available because no internet connection or the ip is banned for too much request so on.
     * When the value is false no request will be made with that provider.
     * @returns the status of the provider.
     */
    // eslint-disable-next-line @typescript-eslint/require-await
    public async isProviderAvailable(): Promise<boolean> {
        return true
    }

    /**
     * Get all Series that the user has watched, planned, completed or stopped watching.
     * @param disableCache disallow to return cached requests.
     */
    public abstract getAllSeries(disableCache?: boolean): Promise<MultiProviderResult[]>
    public abstract logInUser(pass: string, username?: string): Promise<boolean>

    /**
     * Simple boolean check if the user is logged in.
     */
    public abstract isUserLoggedIn(): Promise<boolean>
    /**
     * Deletes all user information and logs the user out.
     */
    public abstract logoutUser(): void
    /**
     * Get User's username in a simple string format.
     */
    public abstract getUsername(): Promise<string>
    /**
     *
     * @param anime
     * @param watchProgress
     * @deprecated
     */
    public abstract updateEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData>
    /**
     *
     * @param anime
     * @param watchProgress
     * @deprecated
     */
    public abstract removeEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData>
    /**
     * Mark all give episodes as watched in the provider
     * @param episodes all episodes that should get marked as watched.
     */
    public abstract markEpisodeAsWatched(episodes: Episode[]): Promise<void>
    /**
     * Mark all given episodes as unwatched in the provider.
     * @param episodes all episodes that shoueld get marked as unwatched.
     */
    public abstract markEpisodeAsUnwatched(episodes: Episode[]): Promise<void>
    /**
     * Get all different lists that the provider can provider from the user.
     * Examples of the list are:
     * MyWatchedSeries2019,
     * Completed,
     * Watched
     */
    public abstract getAllLists(): Promise<ProviderUserList[]>
}
