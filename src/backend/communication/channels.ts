/**
 * Communcation channels for getOnce requests
 */
export enum chOnce {
    GetAllListProviders = 'get-all-list-providers',
    GetUserNameFromProvider = 'get-username-from-provider',
    GetSyncProviderSettings = 'get-sync-provider-settings',
    IsAnyProviderLoggedIn = 'is-any-provider-logged-in',
    GetProviderListSettings = 'get-provider-list-settings',
    GetLoggedInStatus = 'provider-auth-status',
    IsUpdateAvailable = 'is-app-update-available',
    FinishedFirstSetup = 'get-finished-first-setup',
    GetSeriesIdsWithListType = 'get-series-list-with-give-list-type',
    GetSeriesById = 'get-series-id',
}