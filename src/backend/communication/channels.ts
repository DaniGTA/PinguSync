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
}