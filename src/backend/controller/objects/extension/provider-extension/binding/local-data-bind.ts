import ProviderLocalData from '../../../../provider-manager/local-data/interfaces/provider-local-data';


export default abstract class LocalDataBind {
    public id: string | number;
    public providerName: string;
    public targetSeason?: number;

    constructor(provider: ProviderLocalData, seasonNumber?: number) {
        this.id = provider.id;
        this.providerName = provider.provider;
        if (seasonNumber !== undefined) {
            this.targetSeason = seasonNumber;
        }
    }
}
