import Series from '../../controller/objects/series';
import ProviderLocalData from '../../controller/provider-manager/local-data/interfaces/provider-local-data';

export default class ProviderAndSeriesPackage {

    public static generatePackages(providers: ProviderLocalData[], series: Series): ProviderAndSeriesPackage[] {
        const resultList: ProviderAndSeriesPackage[] = [];
        for (const provider of providers) {
            resultList.push(new ProviderAndSeriesPackage(provider, series));
        }
        return resultList;
    }

    public provider: ProviderLocalData;
    public series: Series;

    constructor(provider: ProviderLocalData, series: Series) {
        this.provider = provider;
        this.series = series;
    }


}
