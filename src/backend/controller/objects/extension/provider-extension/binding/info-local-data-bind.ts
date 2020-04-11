import { InfoProviderLocalData } from '../../../../../controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import Season from '../../../meta/season';
import LocalDataBind from './local-data-bind';
export default class InfoLocalDataBind extends LocalDataBind {
    constructor(infoProvider: InfoProviderLocalData, seasonNumber?: Season, lastIndex?: number) {
        super(infoProvider, seasonNumber, lastIndex);
    }
}
