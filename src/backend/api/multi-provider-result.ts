import ProviderLocalData from '../controller/interfaces/provider-local-data'

export default class MultiProviderResult{
    mainProvider: ProviderLocalData;
    subProviders: ProviderLocalData[];
    constructor(mainProvider: ProviderLocalData, ...subProviders: ProviderLocalData[]) {
        this.mainProvider = mainProvider;
        if (subProviders) {
            this.subProviders = subProviders;
        } else {
            this.subProviders = [];
        }
    }
}