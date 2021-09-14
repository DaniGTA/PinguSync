import ICommunication from '../../../../communication/icommunication'
import { chOnce } from '../../../../communication/channels'
import IPCBackgroundController from '../../../../communication/ipc-background-controller'
import AppUpdateController from '../../../auto-updater/app-update-controller'
import { chSend } from '../../../../communication/send-only-channels'

export default class FrontendAppUpdateController {
    private com: ICommunication

    private autoUpdateController: AppUpdateController = new AppUpdateController()

    constructor() {
        this.com = new IPCBackgroundController()
        IPCBackgroundController.on(chOnce.IsUpdateAvailable, () =>
            IPCBackgroundController.send(chOnce.IsUpdateAvailable, false)
        )
        IPCBackgroundController.on(chSend.QuitAndInstall, () => this.autoUpdateController.installUpdate())
        this.autoUpdateController.initListeners()
    }
}
