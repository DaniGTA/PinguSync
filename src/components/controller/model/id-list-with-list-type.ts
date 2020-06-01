import { ListType } from '../../../backend/controller/settings/models/provider/list-types';

export default interface IdListWithName {
    ids: string[];
    listType: ListType;
};
