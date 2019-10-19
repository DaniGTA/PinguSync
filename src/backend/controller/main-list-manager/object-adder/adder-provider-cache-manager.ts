import Series from '../../objects/series';
import AdderProviderCache from './adder-provider-cache';

export default class AdderProviderCacheManager {
    public convertSeriesToProviderCache(series: Series): AdderProviderCache[] {
        const providerLocalData = series.getAllProviderLocalDatas();
        const providerCache: AdderProviderCache[] = [];
        for (const provider of providerLocalData) {
            providerCache.push(new AdderProviderCache(provider.provider, provider.id));
        }
        return providerCache;
    }
}
