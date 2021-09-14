import ICommunication from '../../../../communication/icommunication'
import SettingsManager from '../../../settings/settings-manager'
import IPCBackgroundController from '../../../../communication/ipc-background-controller'
import { chSend } from '../../../../communication/send-only-channels'
import { chOnce } from '../../../../communication/channels'

export default class FrontendUserSettingsController {
    constructor(private settingManager: SettingsManager) {
        this.init()
    }

    private init(): void {
        IPCBackgroundController.on(chSend.FinishFirstSetup, () =>
            this.settingManager.getUserSettingsManager().finishFirstSetup()
        )
        IPCBackgroundController.on(chOnce.FinishedFirstSetup, () =>
            IPCBackgroundController.send(
                chOnce.FinishedFirstSetup,
                this.settingManager.getUserSettings().finishedFirstSetup
            )
        )
    }
}
