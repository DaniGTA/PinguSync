import Series from '../../../controller/objects/series';
import ProviderLocalDataWithSeasonInfo from '../../provider/provider-info-downloader/provider-data-with-season-info';

export default class ProviderAndSeriesPackage {

    public static generatePackages(providers: ProviderLocalDataWithSeasonInfo[], series: Series): ProviderAndSeriesPackage[] {
        const resultList: ProviderAndSeriesPackage[] = [];
        for (const provider of providers) {
            resultList.push(new ProviderAndSeriesPackage(provider, series));
        }
        return resultList;
    }

    public provider: ProviderLocalDataWithSeasonInfo;
    public series: Series;

    constructor(provider: ProviderLocalDataWithSeasonInfo, series: Series) {
        this.provider = provider;
        this.series = series;
    }


}
