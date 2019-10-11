import ProviderLocalData from '../controller/interfaces/provider-local-data';

export default class MultiProviderResult {
    public mainProvider: ProviderLocalData;
    public subProviders: ProviderLocalData[];
    constructor(mainProvider: ProviderLocalData, ...subProviders: ProviderLocalData[]) {
        this.mainProvider = mainProvider;
        if (subProviders) {
            this.subProviders = subProviders;
        } else {
            this.subProviders = [];
        }
    }

    public getAllProviders(): ProviderLocalData[] {
        return [this.mainProvider, ...this.subProviders];
    }
}
