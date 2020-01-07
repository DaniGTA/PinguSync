import { InfoProviderLocalData } from '../../../../../controller/provider-manager/local-data/info-provider-local-data';
import LocalDataBind from './local-data-bind';

export default class InfoLocalDataBind extends LocalDataBind {
    constructor(infoProvider: InfoProviderLocalData, seasonNumber?: number) {
        super(infoProvider, seasonNumber);
    }
}
