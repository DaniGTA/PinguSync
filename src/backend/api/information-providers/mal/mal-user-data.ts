import Series from '../../../controller/objects/series'
import { UserData } from '../../user-data'

export class MalUserData extends UserData {
    public list: Series[] | undefined
    public lastListUpdate: Date | undefined
    public loginData: string | undefined

    public updateList(list: Series[]): void {
        this.list = list
        this.lastListUpdate = new Date(Date.now())
        this.saveData()
    }

    public setToken(loginData: string): void {
        this.loginData = loginData
        this.saveData()
    }
}
