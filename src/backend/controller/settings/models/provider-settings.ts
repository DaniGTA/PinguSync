import ListSettings from './provider/list-settings';
import SyncSettings from './provider/sync-settings';

export default class ProviderSettings {
    public providerName: string;
    public listSettings: ListSettings[] = [];
    public syncSettings: SyncSettings = new SyncSettings();

    constructor(providerName: string) {
        this.providerName = providerName;
    }
}