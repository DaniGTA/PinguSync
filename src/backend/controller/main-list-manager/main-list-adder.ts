import Series from '../objects/series';
import MainListManager from './main-list-manager';
import providerHelper from '../../helpFunctions/provider/provider-helper';
import listHelper from '../../helpFunctions/list-helper';
import ProviderComperator from '../../helpFunctions/comperators/provider-comperator';

export default class MainListAdder{
    private static addingWaitlist: Series[] = [];
    private static addingWaitlistWorker?: undefined | Promise<void>;

    /**
     * Use ListController to add Series too the MainList.
     * 
     * This just managed the Waitlist.
     * @param series 
     */
    async addSeries(...series: Series[]) {
        for (const newSeries of series) {
            let isItemAlreadyInList = false;
            for (const waitlistEntry of MainListAdder.addingWaitlist) {
                if (newSeries != waitlistEntry) {
                    const result = await ProviderComperator.compareAllProviders(newSeries, waitlistEntry);
                    if (result.isAbsolute) {
                        isItemAlreadyInList = true;
                        break;
                    }
                } else {
                    isItemAlreadyInList = true;
                    break;
                }
            }
            if (!isItemAlreadyInList) {
                    MainListAdder.addingWaitlist.push(newSeries);
            }
        }
        while (MainListAdder.addingWaitlist.length != 0) {
            console.log("Start waitlist worker");
            await this.startWaitlistWorker();
        }
        await MainListManager.finishListFilling();
    }

    private async startWaitlistWorker():Promise<void> {
        if (!MainListAdder.addingWaitlistWorker) {
            return MainListAdder.addingWaitlistWorker = this.waitlistWorker();
        } 
        return MainListAdder.addingWaitlistWorker;
    }

    private async waitlistWorker() {
        console.log("Worker started to process " + MainListAdder.addingWaitlist.length + ' Items.');
        let addCounter = 0;
        for (const series of MainListAdder.addingWaitlist) {
            const cachedSeries =series;
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
                console.log('Adding Series to list. Progress: ' + MainListAdder.addingWaitlist.length);
            } catch (err) {
                console.log(err);
            }
            MainListAdder.addingWaitlist = await listHelper.removeEntrys(MainListAdder.addingWaitlist, cachedSeries);
        }

        console.log('Added ' + addCounter + ' to mainList');
        console.log("End waitlist worker");
        MainListAdder.addingWaitlistWorker = undefined;
        return;
    }
}