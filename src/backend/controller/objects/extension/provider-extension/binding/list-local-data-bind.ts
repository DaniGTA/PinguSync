
import { ListProviderLocalData } from '../../../../../controller/provider-manager/local-data/list-provider-local-data';
import LocalDataBind from './local-data-bind';

export default class ListLocalDataBind extends LocalDataBind {
    constructor(listProvider: ListProviderLocalData, seasonNumber?: number) {
        super(listProvider, seasonNumber);
    }
}
