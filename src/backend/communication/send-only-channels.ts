/**
 * Send only channles
 */
export enum chSend {
    UpdateListType = 'update-user-list-update-type',
    /** 
     * Need providername (string) as data.
    */
    LogoutUser = 'provider-logout-user',
    FinishFirstSetup = 'user-settings-mark-first-setup-as-finish',
    QuitAndInstall = 'quitAndInstall',
}