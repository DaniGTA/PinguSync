import SettingsManager from '../../settings/settings-manager';
import FrontendProviderSettingsController from '../providers/frontend-provider-settings-controller';

export default class FrontendSettingsController {
    private settingManager = new SettingsManager();

    constructor(webcontents: Electron.WebContents) {
        new FrontendProviderSettingsController(webcontents, this.settingManager);
    }
}
