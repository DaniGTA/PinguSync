import listHelper from '../../helpFunctions/list-helper';
import { ProviderHelper } from '../../helpFunctions/provider/provider-helper';
import stringHelper from '../../helpFunctions/string-helper';
import logger from '../../logger/logger';
import Series from '../objects/series';
import AdderProviderCache from '../main-list-manager/object-adder/adder-provider-cache';
import ProviderLocalData from '../provider-manager/local-data/interfaces/provider-local-data';

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
    public async addNewProviderData(...providerData: ProviderLocalData[]) {
        const trackId = stringHelper.randomString(50);
        logger.log('info', '[MainListAdder] Start adding');
        ProviderDataListAdder.instanceTracker.push(trackId);
        await this.providerListWorker(providerData);

        //if (ProviderDataListAdder.instanceTracker.length === 1 && ProviderDataListAdder.instanceTracker[0] === trackId) {
        //    await ProviderDataListAdder.finishListFilling();
        //}
        ProviderDataListAdder.instanceTracker = await listHelper.removeEntrys(ProviderDataListAdder.instanceTracker, trackId);
        logger.log('info', '[MainListAdder] End adding');
    }


    /**
     * The list worker will add a array to the main list.
     *
     *  Checks that will be performed:
     *      Is Series already in list ?
     *      All Provider are available ?
     *
     * @param list a series list.
     */
    private async providerListWorker(list: ProviderLocalData[]) {

        return;
    }
}
