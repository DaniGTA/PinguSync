import OAuth from '../../provider/auth/o-auth'
import MultiProviderResult from '../../provider/multi-provider-result'
import { UserData } from '../../user-data'
import { TraktUserInfo } from './objects/userInfo'

export class TraktUserData extends UserData {
    public userInfo?: TraktUserInfo | null
    public list: MultiProviderResult[] | undefined
    public lastListUpdate: Date | undefined

    constructor() {
        super()
        this.userInfo = this.userInfo ?? null
    }

    public updateList(list: MultiProviderResult[]): void {
        this.list = list
        this.lastListUpdate = new Date(Date.now())
        this.saveData()
    }

    public removeTokens(): void {
        this.oAuth = undefined
        this.saveData()
    }

    public setTokens(oAuth: OAuth): void {
        this.oAuth = oAuth
        this.saveData()
    }

    public setUserData(userData: TraktUserInfo): void {
        this.userInfo = userData
        this.userName = userData.user.name
        this.saveData()
    }
}
