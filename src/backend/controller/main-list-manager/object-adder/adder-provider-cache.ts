import Season from '../../objects/meta/season';

export default class AdderProviderCache {
    public readonly providerName: string;
    public readonly providerId: string | number;
    public readonly providerSeason?: Season;
    constructor(providerName: string, providerId: string | number, providerSeason?: Season) {
        this.providerName = providerName;
        this.providerId = providerId;
        this.providerSeason = providerSeason;
    }
}
