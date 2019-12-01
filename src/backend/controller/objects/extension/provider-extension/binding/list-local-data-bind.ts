
import { ListProviderLocalData } from '../../../../../controller/provider-manager/local-data/list-provider-local-data';
import LocalDataBind from './local-data-bind';

export default class ListLocalDataBind extends LocalDataBind {
    public id: string | number;
    public providerName: string;
    public targetSeason?: number;

    constructor(listProvider: ListProviderLocalData) {
        super();
        this.id = listProvider.id;
        this.providerName = listProvider.provider;
        this.targetSeason = listProvider.targetSeason;
    }
}
