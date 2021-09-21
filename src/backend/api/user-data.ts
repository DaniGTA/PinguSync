import ProviderFileSettings from './provider-file-settings'
import OAuth from './provider/auth/o-auth'
export abstract class UserData extends ProviderFileSettings {
    public oAuth: OAuth | undefined
    public userName: string | undefined
    public userImageUrl: string | undefined
    public userJoined: Date | undefined

    constructor() {
        super()
        this.userName = this.userName ?? ''
        this.userImageUrl = this.userImageUrl ?? ''
        this.userJoined = this.userJoined ?? undefined
        this.oAuth = this.oAuth ?? undefined
    }

    public logout(): void {
        this.oAuth = undefined
        this.userImageUrl = ''
        this.userName = ''
        this.userJoined = undefined
    }
}
