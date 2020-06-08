/**
 * Communcation channels for getOnce requests
 */
export enum chOnce {
    GetSyncStatusOfProviderFromASeries = 'get-sync-status-from-single-provider-for-one-series',
    GetAllListProviders = 'get-all-list-providers',
    GetAllListProvidersWithConnectedUser = 'get-all-list-providers-with-user-logged-in',
    GetUserNameFromProvider = 'get-username-from-provider',
    GetSyncProviderSettings = 'get-sync-provider-settings',
    IsAnyProviderLoggedIn = 'is-any-provider-logged-in',
    GetProviderListSettings = 'get-provider-list-settings',
    GetLoggedInStatus = 'provider-auth-status',
    FinishedFirstSetup = 'get-finished-first-setup',

    /*
        Series API
    */

    GetSeriesIdsWithListType = 'get-series-list-with-give-list-type',

    GetSeriesById = 'get-series-id',
    GetPreferedCoverUrlBySeriesId = 'get-prefered-series-cover-url-by-series-id',
    GetPreferedNameBySeriesId = 'get-prefered-series-name-by-id',
    GetSeriesMaxEpisodeNumberBySeriesId = 'get-series-max-episode-number-by-series-id',

    /*
         Update API
    */

    IsUpdateAvailable = 'is-app-update-available',
}
