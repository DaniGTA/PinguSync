import SettingsManager from '../../../src/backend/controller/settings/settings-manager';
import UserSettingsManager from '../../../src/backend/controller/settings/user-settings-manager';
import Settings from '../../../src/backend/controller/settings/models/settings';


describe('User-settings-manager-tests', () => {
    test('should mark the first setup as finished', () => {
        const settingsManager = new SettingsManager();
        settingsManager.loadedSetting = new Settings();
        const userSettingsManager = new UserSettingsManager(settingsManager);
        userSettingsManager.finishFirstSetup();
        expect(settingsManager.loadedSetting.userSettings.finishedFirstSetup).toEqual(true);
    });
});
