import { ListType } from '../settings/models/provider/list-types';

export default class ProviderUserList {
    public name: string;
    public type: ListType;
    public custom = false;

    constructor(name: string, type: ListType) {
        this.name = name;
        this.type = type;
    }
}
