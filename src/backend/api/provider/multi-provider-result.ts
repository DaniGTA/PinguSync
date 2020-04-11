import ProviderLocalData from '../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import ProviderLocalDataWithSeasonInfo from '../../helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';

export default class MultiProviderResult {
    public mainProvider: ProviderLocalDataWithSeasonInfo;
    public subProviders: ProviderLocalDataWithSeasonInfo[] = [];
    constructor(mainProvider: ProviderLocalDataWithSeasonInfo | ProviderLocalData, ...subProviders: Array<ProviderLocalDataWithSeasonInfo | ProviderLocalData>) {
        if (mainProvider instanceof ProviderLocalData) {
            this.mainProvider = new ProviderLocalDataWithSeasonInfo(mainProvider);
        } else {
            this.mainProvider = mainProvider;
        }
        for (const iterator of subProviders) {
            if (iterator instanceof ProviderLocalData) {
                this.subProviders.push(new ProviderLocalDataWithSeasonInfo(iterator));
            } else {
                this.subProviders.push(iterator);
            }
        }
    }

    public getAllProvidersWithSeason(): ProviderLocalDataWithSeasonInfo[] {
        return [this.mainProvider, ...this.subProviders];
    }

    public getAllProviders(): ProviderLocalData[] {
        return this.getAllProvidersWithSeason().flatMap((x) => x.providerLocalData);
    }
}
