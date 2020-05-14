import ICommunication from '../../../../communication/icommunication';
import { chOnce } from '../../../../communication/channels';
import IPCBackgroundController from '../../../../communication/ipc-background-controller';
import AppUpdateController from '../../../auto-updater/app-update-controller';
import { chSend } from '../../../../communication/send-only-channels';

export default class FrontendAppUpdateController {
    private com: ICommunication;

    private autoUpdateController: AppUpdateController = new AppUpdateController();

    constructor(webcontents: Electron.WebContents) {
        this.com = new IPCBackgroundController(webcontents);
        this.com.on(chOnce.IsUpdateAvailable, () => this.com.send(chOnce.IsUpdateAvailable, false));
        this.com.on(chSend.QuitAndInstall, () => this.autoUpdateController.installUpdate());
        this.autoUpdateController.initListeners(webcontents);
    }
}