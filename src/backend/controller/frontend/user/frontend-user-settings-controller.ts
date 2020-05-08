import SettingsManager from '../../settings/settings-manager';
import IPCBackgroundController from '../../../communication/ipc-background-controller';
import ICommunication from '../../../communication/icommunication';
import { chSend } from '../../../communication/send-only-channels';

export default class FrontendUserSettingsController {
    private com: ICommunication;

    constructor(webcontents: Electron.WebContents, private settingManager: SettingsManager) {
        this.com = new IPCBackgroundController(webcontents);
        this.init();
    }

    private init(): void {
        this.com.on(chSend.FinishFirstSetup, () => this.settingManager.getUserSettingsManager().finishFirstSetup());
    }
}
