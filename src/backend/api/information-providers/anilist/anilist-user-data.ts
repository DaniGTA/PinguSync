import { IViewer } from './graphql/viewer'
import MultiProviderResult from '../../provider/multi-provider-result'
import { UserData } from '../../user-data'

export class AniListUserData extends UserData {
    public createdToken: Date = new Date()
    public expiresIn = 0
    public viewer?: IViewer
    public list?: MultiProviderResult[]
    public lastListUpdate?: Date

    public updateList(list: MultiProviderResult[]): void {
        this.list = list
        this.lastListUpdate = new Date(Date.now())
        this.saveData()
    }

    public setViewer(viewer: IViewer): void {
        this.viewer = viewer
        this.userName = viewer.name
        this.saveData()
    }
}
