import ProviderSettings from './provider-settings';
import UserSettings from '../../objects/settings/user-settings';

export default class Settings {
    providerSettings: ProviderSettings[] = []
    userSettings: UserSettings = new UserSettings();
}