import ProviderFileSettings from './provider-file-settings'
export abstract class UserData extends ProviderFileSettings {
    public accessToken: string | undefined
    public refreshToken: string | undefined
    public userName: string | undefined
    public userImageUrl: string | undefined
    public userJoined: Date | undefined

    constructor() {
        super()
        this.accessToken = this.accessToken ?? ''
        this.refreshToken = this.refreshToken ?? undefined
        this.userName = this.userName ?? ''
        this.userImageUrl = this.userImageUrl ?? ''
        this.userJoined = this.userJoined ?? undefined
    }
    public logout(): void {
        this.accessToken = ''
        this.refreshToken = undefined
        this.userImageUrl = ''
        this.userName = ''
        this.userJoined = undefined
    }
}
