import Series from '../series';


export default class FrontendSeriesInfos extends Series {
    public listProviderInfosBinded: any[] = [];
    public infoProviderInfosBinded: any[] = [];
    constructor(series: Series) {
        super();
        Object.assign(this, series);
        this.listProviderInfosBinded = series.getListProvidersInfos();
        this.infoProviderInfosBinded = series.getInfoProvidersInfos();
    }
}
