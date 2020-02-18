import Series from '../../objects/series';
import AdderProviderCache from './adder-provider-cache';

export default class AdderProviderCacheManager {
    public convertSeriesToProviderCache(series: Series): AdderProviderCache[] {
        const providerLocalData = series.getAllProviderLocalDatasWithSeasonInfo();
        const providerCache: AdderProviderCache[] = [];
        for (const providerWithSeasonInfo of providerLocalData) {
            const provider = providerWithSeasonInfo.providerLocalData;
            providerCache.push(new AdderProviderCache(provider.provider, provider.id, providerWithSeasonInfo.seasonTarget));
        }
        return providerCache;
    }
}
