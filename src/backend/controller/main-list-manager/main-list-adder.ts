import Series from '../objects/series';
import MainListManager from './main-list-manager';
import providerHelper from '../../helpFunctions/provider/provider-helper';

export default class MainListAdder {


    /**
     * Use ListController to add Series too the MainList.
     * 
     * This just managed the Waitlist.
     * @param series 
     */
    async addSeries(...series: Series[]) {

        console.log("Start waitlist worker");
        await this.listWorker(series);

        await MainListManager.finishListFilling();
    }



    private async listWorker(list: Series[]) {
        console.log("Worker started to process " + list.length + ' Items.');
        let addCounter = 0;
        for (const series of list) {
            const cachedSeries = series;
            try {
                await MainListManager.addSerieToMainList(series);
                const entry = await MainListManager.findSameSeriesInMainList(series);
                if (entry.length != 1) {
                    console.log("[WARN] Find more or none entry after adding it.");
                } else {
                    try {
                        await MainListManager.addSerieToMainList(await providerHelper.fillMissingProvider(entry[0]));
                    } catch (err) { }
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
