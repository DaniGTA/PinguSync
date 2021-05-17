import { InfoProviderLocalData } from '../../provider-controller/provider-manager/local-data/info-provider-local-data'
import { ListProviderLocalData } from '../../provider-controller/provider-manager/local-data/list-provider-local-data'
import Series from '../series'

export default class FrontendSeriesInfos extends Series {
    public listProviderInfosBinded: ListProviderLocalData[] = []
    public infoProviderInfosBinded: InfoProviderLocalData[] = []
    constructor(series: Series) {
        super()
        Object.assign(this, series)
        this.listProviderInfosBinded = series.getListProvidersInfos()
        this.infoProviderInfosBinded = series.getInfoProvidersInfos()
    }
}
