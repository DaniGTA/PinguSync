import SettingsManager from '../../settings/settings-manager';
import FrontendProviderSettingsController from './provider/frontend-provider-settings-controller';
import FrontendUserSettingsController from './user/frontend-user-settings-controller';

export default class FrontendSettingsController {
    private settingManager = new SettingsManager();

    constructor(webcontents: Electron.WebContents) {
        new FrontendProviderSettingsController(webcontents, this.settingManager);
        new FrontendUserSettingsController(webcontents, this.settingManager);
    }
}
