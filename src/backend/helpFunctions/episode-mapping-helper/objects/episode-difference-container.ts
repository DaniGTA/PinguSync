import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';

export default class EpisodeDifferenceContainer {
    public readonly diff: number = 0;
    public readonly providerNameA: ProviderLocalData;
    public readonly providerNameB: ProviderLocalData;

    constructor(providerNameA: ProviderLocalData, providerNameB: ProviderLocalData, diff = 0) {
        this.providerNameA = providerNameA;
        this.providerNameB = providerNameB;
        this.diff = diff;
    }
}
