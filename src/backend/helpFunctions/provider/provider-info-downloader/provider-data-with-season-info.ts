import Season from '../../../controller/objects/meta/season';
import ProviderLocalData from '../../../controller/provider-manager/local-data/interfaces/provider-local-data';

export default class ProviderDataWithSeasonInfo {
    public providerLocalData: ProviderLocalData;
    public seasonTarget: Season | undefined;

    constructor(providerLocalData: ProviderLocalData, seasonTarget?: Season | undefined) {
        this.providerLocalData = providerLocalData;
        this.seasonTarget = seasonTarget;
    }
}
