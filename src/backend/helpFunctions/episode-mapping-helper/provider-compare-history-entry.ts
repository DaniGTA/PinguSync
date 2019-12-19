import ProviderLocalData from '../../controller/provider-manager/local-data/interfaces/provider-local-data';

export default class ProviderCompareHistoryEntry{
    public providerAName: string;
    public providerBName: string;
    /**
     * Episode difference that has been used to compare provider a and provider b
     *
     * @type {number}
     * @memberof ProviderCompareHistoryEntry
     */
    public compareDiff: number;

    constructor(providerA: ProviderLocalData, providerB: ProviderLocalData, diff: number) {
        this.providerAName = providerA.provider;
        this.providerBName = providerB.provider;
        this.compareDiff = diff;
    }

    public isItTheSameHistoryEntry(otherComparedHistoryEntry: ProviderCompareHistoryEntry): boolean {
        if (this.compareDiff === otherComparedHistoryEntry.compareDiff) {
            if (this.providerAName === otherComparedHistoryEntry.providerAName && this.providerBName === otherComparedHistoryEntry.providerBName) {
                return true;
            } else if (this.providerBName === otherComparedHistoryEntry.providerAName && this.providerAName === otherComparedHistoryEntry.providerBName) {
                return true;
            }
        }
        return false;
    }

    public isItTheSame(providerA: ProviderLocalData, providerB: ProviderLocalData, diff: number): boolean {
        if (this.compareDiff === diff) {
            if (this.providerAName === providerA.provider && this.providerBName === providerB.provider) {
                return true;
            } else if (this.providerBName === providerA.provider  && this.providerAName === providerB.provider) {
                return true;
            }
        }
        return false;
    }
}