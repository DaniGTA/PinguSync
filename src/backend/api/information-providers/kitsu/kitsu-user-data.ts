import Series from '../../../controller/objects/series'
import { UserData } from '../../user-data'

export class KitsuUserData extends UserData {
    public expiresIn = 0
    public list: Series[] | undefined
    public lastListUpdate: Date | undefined

    public updateList(list: Series[]): void {
        this.list = list
        this.lastListUpdate = new Date(Date.now())
        this.saveData()
    }

    public setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
        this.accessToken = accessToken
        this.refreshToken = refreshToken
        this.expiresIn = expiresIn
        this.saveData()
    }
}
