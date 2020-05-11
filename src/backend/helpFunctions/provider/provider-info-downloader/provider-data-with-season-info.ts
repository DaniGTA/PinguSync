import Season from '../../../controller/objects/meta/season';
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';

export default class ProviderLocalDataWithSeasonInfo {
    public providerLocalData: ProviderLocalData;
    public seasonTarget: Season | undefined;
    public confirmed = false;

    constructor(providerLocalData: ProviderLocalData, seasonTarget?: Season | undefined) {
        this.providerLocalData = providerLocalData;
        this.seasonTarget = seasonTarget;
    }
}
