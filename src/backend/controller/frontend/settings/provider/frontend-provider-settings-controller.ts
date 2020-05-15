import ICommunication from '../../../../communication/icommunication';
import IPCBackgroundController from '../../../../communication/ipc-background-controller';
import { chOnce } from '../../../../communication/channels';
import ListProvider from '../../../../api/provider/list-provider';
import AddSyncProvidersModel from '../../providers/model/add-sync-providers-model';
import logger from '../../../../logger/logger';
import SettingsManager from '../../../settings/settings-manager';
import { chSend } from '../../../../communication/send-only-channels';
import UpdateUserListType from '../../providers/model/update-user-list-type';

export default class FrontendProviderSettingsController {
    /**
     * Communication instance to the frontend.
     * @private
     * @type {ICommunication}
     * @memberof FrontendProviderAuthController
     */
    private com: ICommunication;


    /**
     *Creates an instance of FrontendProviderAuthController.
     * @param {Electron.WebContents} webcontents  
     * @memberof FrontendProviderAuthController
     */
    constructor(webcontents: Electron.WebContents, private settingManager: SettingsManager) {
        this.com = new IPCBackgroundController(webcontents);
        this.init();
    }

    private init(): void {
        this.com.on(chOnce.GetSyncProviderSettings, (providerName) => this.com.send(chOnce.GetSyncProviderSettings, this.getAllSyncWithProviderSettings(providerName)));
        this.com.on('add-sync-with-provider', (data) => this.addSyncProviderToSettings(data));
        this.com.on(chOnce.GetProviderListSettings, async (providerName) => this.com.send(chOnce.GetProviderListSettings, await this.settingManager.getAllListSettings(providerName)));
        this.com.on(chSend.UpdateListType, (data) => this.updateUserListType(data));
    }

    private addSyncProviderToSettings(data: AddSyncProvidersModel): void {
        logger.info(`Add ${data.providerNameThatWillBeAddedToSync} as new synced provider to ${data.providerName}`);
    }

    private updateUserListType(data: UpdateUserListType): void {
        data.listSetting.listInfo.type = data.newListType;
        this.settingManager.addListSetting(data.listSetting, data.providerName);
    }

    private getAllSyncWithProviderSettings(providerName: string): ListProvider[] {
        return [];
    }
}