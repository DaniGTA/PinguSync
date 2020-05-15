import ICommunication from '../../../../communication/icommunication';
import SettingsManager from '../../../settings/settings-manager';
import IPCBackgroundController from '../../../../communication/ipc-background-controller';
import { chSend } from '../../../../communication/send-only-channels';
import { chOnce } from '../../../../communication/channels';


export default class FrontendUserSettingsController {
    private com: ICommunication;

    constructor(webcontents: Electron.WebContents, private settingManager: SettingsManager) {
        this.com = new IPCBackgroundController(webcontents);
        this.init();
    }

    private init(): void {
        this.com.on(chSend.FinishFirstSetup, () => this.settingManager.getUserSettingsManager().finishFirstSetup());
        this.com.on(chOnce.FinishedFirstSetup, () => this.com.send(chOnce.FinishedFirstSetup, this.settingManager.getUserSettings().finishedFirstSetup));
    }
}
