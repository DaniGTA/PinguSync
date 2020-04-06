import { jsonMember, jsonObject } from 'typedjson';
import ProviderLocalData from '../../../../provider-manager/local-data/interfaces/provider-local-data';
import Season from '../../../meta/season';

export default abstract class LocalDataBind {
    @jsonMember
    public id: string | number;
    @jsonMember
    public providerName: string;
    @jsonMember
    public targetSeason?: Season;
    @jsonMember
    public readonly instanceName: string;
    @jsonMember
    public lastIndex?: number;

    constructor(provider: ProviderLocalData, seasonNumber?: Season, lastIndex?: number) {
        this.instanceName = this.constructor.name;
        this.id = provider.id;
        this.providerName = provider.provider;
        if (seasonNumber !== undefined) {
            this.targetSeason = seasonNumber;
        }
    }
}
