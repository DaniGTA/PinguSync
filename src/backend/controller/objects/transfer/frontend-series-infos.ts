import Series from '../series';
import { InfoProviderLocalData } from '../../provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../provider-manager/local-data/list-provider-local-data';

export class FrontendSeriesInfos extends Series {
    public listProviderInfosBinded: ListProviderLocalData[] = [];
    public infoProviderInfosBinded: InfoProviderLocalData[] = [];
    public constructor(series: Series) {
        super();
        Object.assign(this, series);
        this.listProviderInfosBinded = series.getListProvidersInfos();
        this.infoProviderInfosBinded = series.getInfoProvidersInfos();
    }
}