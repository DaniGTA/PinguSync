import Settings from './models/settings';
import ProviderSettings from './models/provider-settings';
import ListSettings from './models/provider/list-settings';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import ProviderList from '../provider-controller/provider-manager/provider-list';
import ListProvider from '../../api/provider/list-provider';
import ProviderUserList from '../objects/provider-user-list';
import logger from '../../logger/logger';
import UserSettings from '../objects/settings/user-settings';
import UserSettingsManager from './user-settings-manager';

export default class SettingsManager {
    public loadedSetting?: Settings;

    /**
     * Sync Settings
     * ===============================================================
     */
    /**
     * 
     * @param providerName 
     */
    public disableSyncForProvider(providerName: string): void {
        const providerSettings = this.getProviderSetting(providerName);
        providerSettings.syncSettings.changesAllowed = false;
        this.save();
    }

    public enableSyncForProvider(providerName: string): void {
        const providerSettings = this.getProviderSetting(providerName);
        providerSettings.syncSettings.changesAllowed = true;
        this.save();
    }

    public isSyncEnabledForProvider(providerName: string): boolean {
        const providerSettings = this.getProviderSetting(providerName);
        return providerSettings.syncSettings.changesAllowed;
    }

    /**
    * List Settings
    * ===============================================================
    */

    public addListSetting(newListSetting: ListSettings, providerName: string): void {
        const providerSettings = this.getProviderSetting(providerName);
        const listSetting = providerSettings.listSettings.findIndex((entry) => entry.listInfo.name === newListSetting.listInfo.name);
        if (listSetting !== -1) {
            providerSettings.listSettings[listSetting] = newListSetting;
            this.save();
            return;
        }

        providerSettings.listSettings.push(newListSetting);
        this.save();
    }


    private getProviderSetting(providerName: string): ProviderSettings {
        const settings = this.getSetting().providerSettings;
        for (const providerSetting of this.getSetting().providerSettings) {
            if (providerSetting.providerName === providerName) {
                return providerSetting;
            }
        }
        const newProvider = new ProviderSettings(providerName);
        settings.push(newProvider);
        return newProvider;
    }

    public async getAllListSettings(providerName: string): Promise<ListSettings[]> {
        const providerInstance = ProviderList.getProviderInstanceByProviderName(providerName);
        if (providerInstance instanceof ListProvider) {
            try {
                const providerLists = await providerInstance.getAllLists();
                this.updateListEntrys(providerLists, providerName);
            } catch (err) {
                logger.error(err);
            }
            return this.getProviderSetting(providerName).listSettings;
        }

        return this.getProviderSetting(providerName).listSettings;

    }

    public getUserSettingsManager(): UserSettingsManager {
        return new UserSettingsManager(this);
    }

    public getUserSettings(): UserSettings {
        const settings = this.getSetting();
        const userSettings = settings.userSettings;
        if (userSettings) {
            return userSettings;
        } else {
            settings.userSettings = new UserSettings();
            this.save();
            return settings.userSettings;
        }
    }

    public saveUserSettings(newSettings: UserSettings): void {
        const settings = this.getSetting();
        settings.userSettings = newSettings;
        this.save();
    }

    private updateListEntrys(lists: ProviderUserList[], providerName: string): void {
        const currentListSettings = this.getProviderSetting(providerName).listSettings;
        for (const entry of lists) {
            const existingEntry = currentListSettings.find(x => x.listInfo.name == entry.name);
            if (!existingEntry) {
                this.addListSetting(new ListSettings(entry), providerName);
            }
        }
    }

    private getSetting(): Settings {
        if (this.loadedSetting) {
            return this.loadedSetting;
        } else if (existsSync('settings.json')) {
            try {
                this.loadedSetting = JSON.parse(readFileSync('settings.json', 'UTF-8')) as Settings;
                return this.loadedSetting;
            } catch (err) {
                logger.error(err);
            }
        }
        this.loadedSetting = new Settings();
        return this.loadedSetting;
    }


    private save(): void {
        writeFileSync('settings.json', JSON.stringify(this.loadedSetting));
    }
}