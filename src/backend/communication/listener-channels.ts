/**
 * Send only channles
 */
export enum chListener {
    OnLoggedInStatusChange = 'provider-any-login-status-changed',
    OnNewUpdateStatusAvailable = 'on-app-update-available-status-changed',
    OnUpdateDownload = 'on-app-update-downloaded',
    OnUpdateReady = 'updateReady',
}