import AdderProviderCache from '../../main-list-manager/object-adder/adder-provider-cache';
import ProviderLocalData from '../provider-manager/local-data/interfaces/provider-local-data';
import ProviderDataListManager from './provider-data-list-manager';

export default class ProviderDataListAdder {
    /**
     * Stores all adding instances.
     *
     * Side info: Every time a provider data will be add to the Series it will be added to a worker
     *            and the worker will perform all details that are needed to add the provider data.
     *            Every worker instance has its own instance id that will be tracked below.
     *            Only when a worker finish his work and no other instance is open it is allowed to perform a clean up.
     */
    public static instanceTracker: string[] = [];

    /**
     * This prevents double adding the same entry.
     */
    public static currentlyAdding: AdderProviderCache[] = [];

    /**
     * This just managed the Waitlist.
     * @param providerData
     */
    public async addNewProviderData(...providerData: ProviderLocalData[]): Promise<number | undefined> {
        for (const entry of providerData) {
            return ProviderDataListManager.addProviderLocalDataToMainList(entry);
        }
        return undefined;
    }
}
