import { ListType } from './list-types';
import ProviderUserList from '../../../objects/provider-user-list';

export default class ListSettings {
    public syncEnabled = true;
    public listInfo: ProviderUserList;

    constructor(listInfo: ProviderUserList) {
        this.listInfo = listInfo;
    }
}