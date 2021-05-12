import MultiProviderResult from '../../provider/multi-provider-result'
import { UserData } from '../../user-data'
import { TraktUserInfo } from './objects/userInfo'

export class TraktUserData extends UserData {
    public expiresIn?: number
    public userInfo?: TraktUserInfo | null
    public list: MultiProviderResult[] | undefined
    public lastListUpdate: Date | undefined

    constructor() {
        super()
        this.expiresIn = this.expiresIn ?? 0
        this.userInfo = this.userInfo ?? null
    }

    public updateList(list: MultiProviderResult[]): void {
        this.list = list
        this.lastListUpdate = new Date(Date.now())
        this.saveData()
    }

    public removeTokens(): void {
        this.accessToken = ''
        this.refreshToken = ''
        this.expiresIn = 0
        this.saveData()
    }

    public setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
        this.accessToken = accessToken
        this.refreshToken = refreshToken
        this.expiresIn = expiresIn
        this.saveData()
    }

    public setUserData(userData: TraktUserInfo): void {
        this.userInfo = userData
        this.userName = userData.user.name
        this.saveData()
    }
}
