import listHelper from '../../helpFunctions/list-helper';
import NewProviderHelper from '../../helpFunctions/provider/new-provider-helper';
import SeriesHelper from '../../helpFunctions/series-helper';
import StringHelper from '../../helpFunctions/string-helper';
import logger from '../../logger/logger';
import Series from '../objects/series';
import ProviderDataListManager from '../provider-controller/provider-data-list-manager/provider-data-list-manager';
import MainListManager from './main-list-manager';
import MainListSearcher from './main-list-searcher';
import AdderProviderCache from './object-adder/adder-provider-cache';
import AdderProviderCacheManager from './object-adder/adder-provider-cache-manager';
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
    public async addSeries(...series: Series[]): Promise<void> {
        const trackId = StringHelper.randomString(50);
        logger.log('info', '[MainListAdder] Start adding');
        MainListAdder.instanceTracker.push(trackId);
        await this.listWorker(series);

        if (MainListAdder.instanceTracker.length === 1 && MainListAdder.instanceTracker[0] === trackId) {
            await MainListManager.finishListFilling();
            ProviderDataListManager.requestSaveProviderList();
        }
        MainListAdder.instanceTracker = listHelper.removeEntrys(MainListAdder.instanceTracker, trackId);
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
    private async listWorker(list: Series[]): Promise<void> {
        const searcher = new MainListSearcher();
        const providerCacheManager = new AdderProviderCacheManager();
        logger.debug('[MainListAdder] Worker started to process ' + list.length + ' Items.');
        let addCounter = 0;
        for (const series of list) {
            const providerCache = providerCacheManager.convertSeriesToProviderCache(series);
            if (MainListAdder.currentlyAdding.length === 0 || !await listHelper.isAnyListEntryInList(MainListAdder.currentlyAdding, providerCache)) {
                MainListAdder.currentlyAdding.push(...providerCache);
                try {
                    const entrys = await searcher.quickFindSameSeriesInMainList(series);
                    if (entrys.length === 0) {
                        logger.debug('[MainListAdder] Add non existing Series.');
                        const filledSeries = await NewProviderHelper.getAllRelevantProviderInfosForSeries(series);
                        if (filledSeries.lastInfoUpdate === 0) {
                            logger.error('[ERROR] Series no last info update!');
                        }
                        await MainListManager.addSerieToMainList(filledSeries);
                    } else {
                        for (const entry of entrys) {
                            await this.updateExistingEntry(series, entry);
                        }
                    }
                    addCounter++;
                    logger.log('info', '[MainListAdder] Adding Series to list. Progress: ' + addCounter + '/' + list.length);
                } catch (err) {
                    logger.error('[MainListAdder] [listWorker]: (error below)');
                    logger.error(err);
                }
                listHelper.removeEntrys(MainListAdder.currentlyAdding, ...providerCache);
            }
        }
        logger.log('info', 'Added ' + addCounter + ' to mainList');
        logger.log('info', 'End waitlist worker');
        return;
    }

    private async updateExistingEntry(series: Series, existingEntry: Series): Promise<void> {
        try {
            logger.log('info', '[MainListAdder] Add existing Series.');
            series.id = existingEntry.id;
            if (SeriesHelper.canUpdateSeries(series, existingEntry)) {
                const updateExistingEntry = await NewProviderHelper.getAllRelevantProviderInfosForSeries(existingEntry);
                await MainListManager.updateSerieInList(updateExistingEntry);
            }

            await MainListManager.updateSerieInList(series);
        } catch (err) {
            logger.error(err);
        }
    }

    private requestSave(): void {
        ProviderDataListManager.requestSaveProviderList();
        MainListManager.requestSaveMainList();
    }
}
