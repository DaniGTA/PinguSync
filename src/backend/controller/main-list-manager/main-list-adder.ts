import Series from '../objects/series';
import MainListManager from './main-list-manager';
import providerHelper from '../../helpFunctions/provider/provider-helper';
import stringHelper from '../../helpFunctions/string-helper';
import listHelper from 'src/backend/helpFunctions/list-helper';

export default class MainListAdder {

    static instanceTracker: string[] = [];
    /**
     * Use ListController to add Series too the MainList.
     * 
     * This just managed the Waitlist.
     * @param series 
     */
    async addSeries(...series: Series[]) {
        const trackId = stringHelper.randomString(50);
        console.log("Start adding");
        MainListAdder.instanceTracker.push(trackId)
        await this.listWorker(series);

        if (MainListAdder.instanceTracker.length === 1 && MainListAdder.instanceTracker[0] === trackId) {
            await MainListManager.finishListFilling();
        }
        MainListAdder.instanceTracker = await listHelper.removeEntrys(MainListAdder.instanceTracker, trackId);
        console.log("End adding");
    }



    private async listWorker(list: Series[]) {
        console.log("Worker started to process " + list.length + ' Items.');
        let addCounter = 0;
        for (const series of list) {
            try {
                const entry = await MainListManager.findSameSeriesInMainList(series);
                if (entry.length == 0) {
                    console.log('Add non existing Series.');
                    const filledSeries = await providerHelper.fillMissingProvider(series);
                    if (filledSeries.lastInfoUpdate === 0) {
                        console.log('[ERROR] Series no last info update!')
                    }
                    await MainListManager.addSerieToMainList(filledSeries);
                    
                } else if(entry.length == 1){
                    try {
                        console.log('Add existing Series.');
                        const tempSeries = await entry[0].merge(series);
                        const filledSeries = await providerHelper.fillMissingProvider(tempSeries);
                        if (filledSeries.lastInfoUpdate === 0) {
                            console.log('[ERROR] Series no last info update!')
                        }
                        await MainListManager.addSerieToMainList(filledSeries);
                    } catch (err) { }
                } else {
                    const rdmProvider = series.getAllProviderLocalDatas()[0];
                    console.log('[WARNING] Found more results from main list from one Series! '+rdmProvider.provider+': '+rdmProvider.id)
                }
                addCounter++;
                console.log('Adding Series to list. Progress: ' + addCounter);
            } catch (err) {
                console.log(err);
            }
        }

        console.log('Added ' + addCounter + ' to mainList');
        console.log("End waitlist worker");
        return;
    }
}
