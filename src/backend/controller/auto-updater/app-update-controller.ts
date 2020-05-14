import { autoUpdater } from 'electron-updater';
import logger from '../../logger/logger';
export default class AppUpdateController {
    public initListeners(webContents: Electron.WebContents): void {
        autoUpdater.on('update-downloaded', () => {
            webContents.send('updateReady');
        });
    }

    public static async checkUpdate(): Promise<void> {
        autoUpdater.logger = logger;
        autoUpdater.autoDownload = true;
        await autoUpdater.checkForUpdatesAndNotify();
    }

    public installUpdate(): void {
        autoUpdater.quitAndInstall();
    }
}
