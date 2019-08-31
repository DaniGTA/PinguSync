import Series from '../objects/series';
import MainListManager from './main-list-manager';
import providerHelper from 'src/backend/helpFunctions/provider/provider-helper';

export default class MainListAdder{
    private static addingWaitlist: Series[] = [];
    private static addingWaitlistWorker?: undefined | Promise<void>;


    addSeries(...series: Series[]) {
        MainListAdder.addingWaitlist.push(...series);
        this.startWaitlistWorker();
    }

    private startWaitlistWorker() {
        if (!MainListAdder.addingWaitlistWorker) {
            MainListAdder.addingWaitlistWorker = this.waitlistWorker();
        }
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
        }

        console.log('Added ' + addCounter + ' to mainList');
        await MainListManager.finishListFilling();
        if (MainListAdder.addingWaitlist.length != 0) {
            MainListAdder.addingWaitlistWorker = undefined;
            this.startWaitlistWorker();
        }
    }
}