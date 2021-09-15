import SettingsManager from '../../../settings/settings-manager'
import IPCBackgroundController from '../../../../communication/ipc-background-controller'
import { chSend } from '../../../../communication/send-only-channels'
import { chOnce } from '../../../../communication/channels'

export default class FrontendUserSettingsController {
    constructor(private settingManager: SettingsManager) {
        this.init()
    }

    private init(): void {
        void IPCBackgroundController.on(chSend.FinishFirstSetup, () =>
            this.settingManager.getUserSettingsManager().finishFirstSetup()
        )
        void IPCBackgroundController.on(chOnce.FinishedFirstSetup, (unused, token) =>
            IPCBackgroundController.send(
                chOnce.FinishedFirstSetup,
                this.settingManager.getUserSettings().finishedFirstSetup,
                token
            )
        )
    }
}
