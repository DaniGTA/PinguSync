import { InfoProviderLocalData } from '../../../../../controller/provider-manager/local-data/info-provider-local-data';
import LocalDataBind from './local-data-bind';

export default class InfoLocalDataBind extends LocalDataBind {
    public id: string | number;
    public providerName: string;
    public targetSeason?: number;

    constructor(infoProvider: InfoProviderLocalData) {
        super();
        this.id = infoProvider.id;
        this.providerName = infoProvider.provider;
        this.targetSeason = infoProvider.targetSeason;
    }
}
