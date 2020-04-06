
import { ListProviderLocalData } from '../../../../../controller/provider-manager/local-data/list-provider-local-data';
import Season from '../../../meta/season';
import LocalDataBind from './local-data-bind';
import { jsonObject } from 'typedjson';
@jsonObject()
export default class ListLocalDataBind extends LocalDataBind {
    constructor(listProvider: ListProviderLocalData, seasonNumber?: Season, index?: number) {
        super(listProvider, seasonNumber, index);
    }
}
