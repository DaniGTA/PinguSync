import ProviderLocalData from '../../../../provider-manager/local-data/interfaces/provider-local-data';
import Season from '../../../meta/season';


export default abstract class LocalDataBind {
    public id: string | number;
    public providerName: string;
    public targetSeason?: Season;
    public readonly instanceName: string;

    constructor(provider: ProviderLocalData, seasonNumber?: Season) {
        this.instanceName = this.constructor.name;
        this.id = provider.id;
        this.providerName = provider.provider;
        if (seasonNumber !== undefined) {
            this.targetSeason = seasonNumber;
        }
    }
}
