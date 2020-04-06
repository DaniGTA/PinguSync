import { InfoProviderLocalData } from '../../../../../controller/provider-manager/local-data/info-provider-local-data';
import Season from '../../../meta/season';
import LocalDataBind from './local-data-bind';
import { jsonObject } from 'typedjson';

@jsonObject()
export default class InfoLocalDataBind extends LocalDataBind {
    constructor(infoProvider: InfoProviderLocalData, seasonNumber?: Season, lastIndex?: number) {
        super(infoProvider, seasonNumber, lastIndex);
    }
}
