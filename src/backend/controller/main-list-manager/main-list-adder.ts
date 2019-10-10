import listHelper from '../../helpFunctions/list-helper';
import providerHelper from '../../helpFunctions/provider/provider-helper';
import stringHelper from '../../helpFunctions/string-helper';
import logger from '../../logger/logger';
import Series from '../objects/series';
import MainListManager from './main-list-manager';
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
     * Use ListController to add Series too the MainList.
     *
     * This just managed the Waitlist.
     * @param series
     */
    public async addSeries(...series: Series[]) {
        const trackId = stringHelper.randomString(50);
        logger.log('info', 'Start adding');
        MainListAdder.instanceTracker.push(trackId);
        await this.listWorker(series);

        if (MainListAdder.instanceTracker.length === 1 && MainListAdder.instanceTracker[0] === trackId) {
            await MainListManager.finishListFilling();
        }
        MainListAdder.instanceTracker = await listHelper.removeEntrys(MainListAdder.instanceTracker, trackId);
        logger.log('info', 'End adding');
    }


    /**
     * The list worker will add a array to the main list.
     *
     *  Checks that will be performed:
     *      Is Series already in list ?
     *      All Provider are avaible ?
     *
     * @param list a series list.
     */
    private async listWorker(list: Series[]) {
        logger.log('info', 'Worker started to process ' + list.length + ' Items.');
        let addCounter = 0;
        for (const series of list) {
            try {
                const entry = await MainListManager.quickFindSameSeriesInMainList(series);
                if (entry.length === 0) {
                    logger.log('info', 'Add non existing Series.');
                    const filledSeries = await providerHelper.fillMissingProvider(series);
                    if (filledSeries.lastInfoUpdate === 0) {
                       logger.error('[ERROR] Series no last info update!');
                    }
                    await MainListManager.addSerieToMainList(filledSeries);

                } else if (entry.length === 1) {
                    try {
                        logger.log('info', 'Add existing Series.');
                        const tempSeries = await entry[0].merge(series);
                        const filledSeries = await providerHelper.fillMissingProvider(tempSeries);
                        if (filledSeries.lastInfoUpdate === 0) {
                           logger.error('[ERROR] Series no last info update!');
                        }
                        await MainListManager.addSerieToMainList(filledSeries);
                    } catch (err) { }
                } else {
                    const rdmProvider = series.getAllProviderLocalDatas()[0];
                    logger.warn('[WARNING] Found more results from main list from one Series! ' + rdmProvider.provider + ': ' + rdmProvider.id);
                    await MainListManager.addSerieToMainList(series);
                }
                addCounter++;
                logger.log('info', 'Adding Series to list. Progress: ' + addCounter);
            } catch (err) {
               logger.error(err);
            }
        }

        logger.log('info', 'Added ' + addCounter + ' to mainList');
        logger.log('info', 'End waitlist worker');
        return;
    }
}
