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
        await this.startWaitlistWorker();
    }

    private async startWaitlistWorker():Promise<void> {
        if (!MainListAdder.addingWaitlistWorker) {
            MainListAdder.addingWaitlistWorker = this.waitlistWorker();
        }
        return MainListAdder.addingWaitlistWorker;
    }

    private async waitlistWorker() {
        
        let addCounter = 0;
        for (const anime of MainListAdder.addingWaitlist) {
            await MainListManager.addSerieToMainList(anime);
            const entry = await MainListManager.findSameSeriesInMainList(anime);
            if (entry.length != 1) {
                console.log("[WARN] Find more or none entry after adding it.");
            } else {
                try {
                    await MainListManager.addSerieToMainList(await providerHelper.fillMissingProvider(entry[0]));
                } catch (err) { }
            }
            addCounter++;
            console.log('Adding Series to list. Progress: ' + MainListAdder.addingWaitlist.length);
            MainListAdder.addingWaitlist = await listHelper.removeEntrys(MainListAdder.addingWaitlist, anime);
        }

        console.log('Added ' + addCounter + ' to mainList');
        await MainListManager.finishListFilling();
        if (MainListAdder.addingWaitlist.length != 0) {
            MainListAdder.addingWaitlistWorker = undefined;
            this.startWaitlistWorker();
        }
    }
}