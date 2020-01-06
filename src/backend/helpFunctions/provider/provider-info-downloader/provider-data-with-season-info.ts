import ProviderLocalData from '../../../controller/provider-manager/local-data/interfaces/provider-local-data';

export default class ProviderDataWithSeasonInfo {
    public providerLocalData: ProviderLocalData;
    public seasonTarget: number | undefined;

    constructor(providerLocalData: ProviderLocalData, seasonTarget: number | undefined) {
        this.providerLocalData = providerLocalData;
        this.seasonTarget = seasonTarget;
    }
}
