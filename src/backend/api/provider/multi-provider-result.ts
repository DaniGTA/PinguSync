import ProviderLocalData from '../../controller/provider-manager/local-data/interfaces/provider-local-data';
import ProviderDataWithSeasonInfo from '../../helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';

export default class MultiProviderResult {
    public mainProvider: ProviderDataWithSeasonInfo;
    public subProviders: ProviderDataWithSeasonInfo[] = [];
    constructor(mainProvider: ProviderDataWithSeasonInfo | ProviderLocalData, ...subProviders: Array<ProviderDataWithSeasonInfo | ProviderLocalData>) {
        if (mainProvider instanceof ProviderLocalData) {
            this.mainProvider = new ProviderDataWithSeasonInfo(mainProvider);
        } else {
            this.mainProvider = mainProvider;
        }
        for (const iterator of subProviders) {
            if (iterator instanceof ProviderLocalData) {
                this.subProviders.push(new ProviderDataWithSeasonInfo(iterator));
            } else {
                this.subProviders.push(iterator);
            }
        }
    }

    public getAllProvidersWithSeason(): ProviderDataWithSeasonInfo[] {
        return [this.mainProvider, ...this.subProviders];
    }

    public getAllProviders(): ProviderLocalData[] {
        return this.getAllProvidersWithSeason().flatMap((x) => x.providerLocalData);
    }
}
