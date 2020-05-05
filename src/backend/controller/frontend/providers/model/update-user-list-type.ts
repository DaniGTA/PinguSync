import ListSettings from '../../../settings/models/provider/list-settings';
import { ListType } from '../../../settings/models/provider/list-types';

export default interface UpdateUserListType {
    listSetting: ListSettings;
    newListType: ListType;
    providerName: string;
}
