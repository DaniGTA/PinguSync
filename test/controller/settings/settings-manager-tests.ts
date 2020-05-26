import SettingsManager from '../../../src/backend/controller/settings/settings-manager';
import Settings from '../../../src/backend/controller/settings/models/settings';
import ListSettings from '../../../src/backend/controller/settings/models/provider/list-settings';
import ProviderUserList from '../../../src/backend/controller/objects/provider-user-list';
import { ListType } from '../../../src/backend/controller/settings/models/provider/list-types';

describe('settings-manager-tests', () => {
    test('should disable sync for provider', () => {
        const settingsManager = new SettingsManager();
        settingsManager.loadedSetting = new Settings();
        settingsManager.disableSyncForProvider('test');
        expect(settingsManager.isSyncEnabledForProvider('test')).toEqual(false);
    });

    test('should enable sync for provider', () => {
        const settingsManager = new SettingsManager();
        settingsManager.loadedSetting = new Settings();
        settingsManager.enableSyncForProvider('test');
        expect(settingsManager.isSyncEnabledForProvider('test')).toEqual(true);
    });

    test('should change list type', async () => {
        const settingsManager = new SettingsManager();
        settingsManager.loadedSetting = new Settings();
        settingsManager.addListSetting(new ListSettings(new ProviderUserList('watching', ListType.CUSTOM)), 'test');
        settingsManager.addListSetting(new ListSettings(new ProviderUserList('watching', ListType.CURRENT)), 'test');
        expect((await settingsManager.getAllListSettings('test'))[0].listInfo.type).toEqual(ListType.CURRENT);
    });

    test('should get non existing provider setting', () => {
        const settingsManager = new SettingsManager();
        const providerSetting = settingsManager['getProviderSetting']('test');
        expect(providerSetting.providerName).toEqual('test');
    });
});
