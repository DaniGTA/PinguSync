
import { MappingProviderLocalData } from '../../../../provider-controller/provider-manager/local-data/mapping-provider-local-data';
import Season from '../../../meta/season';
import LocalDataBind from './local-data-bind';
export default class MappingLocalDataBind extends LocalDataBind {
    constructor(listProvider: MappingProviderLocalData, seasonNumber?: Season, index?: number) {
        super(listProvider, seasonNumber, index);
    }
}
