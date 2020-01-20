
import { ListProviderLocalData } from '../../../../../controller/provider-manager/local-data/list-provider-local-data';
import Season from '../../../meta/season';
import LocalDataBind from './local-data-bind';

export default class ListLocalDataBind extends LocalDataBind {
    constructor(listProvider: ListProviderLocalData, seasonNumber?: Season) {
        super(listProvider, seasonNumber);
    }
}
