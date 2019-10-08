import ProviderLocalData from '../../controller/interfaces/provider-local-data';

export default class EpisodeDifferenceContainer {
    diff: number = 0;
    providerNameA: ProviderLocalData;
    providerNameB: ProviderLocalData;

    constructor(providerNameA: ProviderLocalData, providerNameB: ProviderLocalData, diff = 0) {
        this.providerNameA = providerNameA;
        this.providerNameB = providerNameB;
        this.diff = diff;
    }
}
