import { autoUpdater, app } from 'electron';
import * as electronUpdater from 'update-electron-app';
export default class AppUpdateController {
    private static readonly serverUrl = ''
    public static initController() {
        electronUpdater.updater({
            repo: 'DaniGTA/listManager',
            updateInterval: '1 hour',
            logger: require('electron-log')
        });

    }
}
