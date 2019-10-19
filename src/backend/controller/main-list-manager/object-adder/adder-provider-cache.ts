export default class AdderProviderCache {
    public readonly providerName: string;
    public readonly providerId: string | number;
    constructor(providerName: string, providerId: string | number) {
        this.providerName = providerName;
        this.providerId = providerId;
    }
}
