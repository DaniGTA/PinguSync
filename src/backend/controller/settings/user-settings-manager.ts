import SettingsManager from './settings-manager';

export default class UserSettingsManager {
    constructor(public settingsManager: SettingsManager) {
    }

    public finishFirstSetup(): void {
        const userSettings = this.settingsManager.getUserSettings();
        userSettings.finishedFirstSetup = true;
        this.settingsManager.saveUserSettings(userSettings);
    }
}