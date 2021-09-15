import { ipcRenderer } from 'electron'
import { autoUpdater } from 'electron-updater'
import logger from '../../logger/logger'
export default class AppUpdateController {
    public static async checkUpdate(): Promise<void> {
        autoUpdater.logger = logger
        autoUpdater.autoDownload = true
        await autoUpdater.checkForUpdatesAndNotify()
    }

    public initListeners(): void {
        autoUpdater.on('update-downloaded', () => {
            ipcRenderer.sendToHost('updateReady')
        })
    }

    public installUpdate(): void {
        autoUpdater.quitAndInstall()
    }
}
