import ProviderLocalData from '../../provider-controller/provider-manager/local-data/interfaces/provider-local-data'
import Series from '../series'

export default class RelationSearchResults {
    public foundedProviderLocalDatas: ProviderLocalData[]
    public foundedSeries: Series | null
    public relationExistButNotFounded = false
    constructor(foundedSeries: Series | null, ...foundedProviderLocalDatas: ProviderLocalData[]) {
        this.foundedSeries = foundedSeries
        this.foundedProviderLocalDatas = foundedProviderLocalDatas
        if (this.foundedSeries == null && foundedProviderLocalDatas.length !== 0) {
            this.relationExistButNotFounded = true
        } else {
            this.relationExistButNotFounded = false
        }
    }
}
