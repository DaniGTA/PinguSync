import listHelper from '../../helpFunctions/list-helper';
import providerHelper from '../../helpFunctions/provider/provider-info-downloader/provider-info-downloaderhelper';
import stringHelper from '../../helpFunctions/string-helper';
import logger from '../../logger/logger';
import Series from '../objects/series';
import MainListManager from './main-list-manager';
import MainListSearcher from './main-list-searcher';
import AdderProviderCache from './object-adder/adder-provider-cache';
import AdderProviderCacheManager from './object-adder/adder-provider-cache-manager';
import { ProviderInfoStatus } from '../provider-manager/local-data/interfaces/provider-info-status';
import { ProviderHelper } from '../../helpFunctions/provider/provider-helper';
export default class MainListAdder {
    /**
     * Stores all adding instances.
     *
     * Side info: Every time a series will be add to the Series it will be added to a worker
     *            and the worker will perform all details that are needed to add the series.
     *            Every worker instance has its own instance id that will be tracked below.
     *            Only when a worker finish his work and no other instance is open it is allowed to perform a clean up.
     */
    public static instanceTracker: string[] = [];

    /**
     * This prevents double adding the same entry.
     */
    public static currentlyAdding: AdderProviderCache[] = [];

    /**
     * Use ListController to add Series too the MainList.
     *
     * This just managed the Waitlist.
     * @param series
     */
    public async addSeries(...series: Series[]) {
        const trackId = stringHelper.randomString(50);
        logger.log('info', '[MainListAdder] Start adding');
        MainListAdder.instanceTracker.push(trackId);
        await this.listWorker(series);

        if (MainListAdder.instanceTracker.length === 1 && MainListAdder.instanceTracker[0] === trackId) {
            await MainListManager.finishListFilling();
        }
        MainListAdder.instanceTracker = await listHelper.removeEntrys(MainListAdder.instanceTracker, trackId);
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
    private async listWorker(list: Series[]) {
        const searcher = new MainListSearcher();
         const providerHelper = new ProviderHelper();
        const providerCacheManager = new AdderProviderCacheManager();
        logger.debug('[MainListAdder] Worker started to process ' + list.length + ' Items.');
        let addCounter = 0;
        for (const series of list) {
            const providerCache = providerCacheManager.convertSeriesToProviderCache(series);
            if (MainListAdder.currentlyAdding.length === 0 || !await listHelper.isAnyListEntryInList(MainListAdder.currentlyAdding, providerCache)) {
                MainListAdder.currentlyAdding.push(...providerCache);
                try {
                    const entry = await searcher.quickFindSameSeriesInMainList(series);
                    if (entry.length === 0) {
                        logger.debug('[MainListAdder] Add non existing Series.');
                        const filledSeries = await providerHelper.requestFullProviderUpdate(series);
                        if (filledSeries.lastInfoUpdate === 0) {
                            logger.error('[ERROR] Series no last info update!');
                        }
                        await MainListManager.addSerieToMainList(filledSeries);
                    } else if (entry.length === 1) {
                        try {
                            logger.log('info', '[MainListAdder] Add existing Series.');
                            series.id = entry[0].id;
                            await MainListManager.updateSerieInList(series);
                        } catch (err) {
                            logger.warn(err);
                        }
                    } else {
                        const rdmProvider = series.getAllProviderLocalDatas()[0];
                        logger.warn('[WARNING] Found more results from main list from one Series! ' + rdmProvider.provider + ': ' + rdmProvider.id);
                        await MainListManager.addSerieToMainList(series);
                    }
                    addCounter++;
                    logger.log('info', '[MainListAdder] Adding Series to list. Progress: ' + addCounter);
                } catch (err) {
                    logger.error('[MainListAdder] [listWorker]: (error below)');
                    logger.error(err);
                }
            }
            await listHelper.removeEntrys(MainListAdder.currentlyAdding, ...providerCache);
        }

        logger.log('info', 'Added ' + addCounter + ' to mainList');
        logger.log('info', 'End waitlist worker');
        return;
    }
}
