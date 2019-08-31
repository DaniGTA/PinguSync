import Series from "../objects/series";
import FrontendController from '../frontend-controller';
import seriesHelper from '../../helpFunctions/series-helper';
import listHelper from '../../helpFunctions/list-helper';
import MainListPackageManager from './main-list-package-manager';
import MainListLoader from './main-list-loader';

export default class MainListManager {
    private static mainList: Series[] = [];
    private static listLoaded = false;
    private static listMaintance = false;
    private static secondList: Series[] = [];

    public static async addSerieToMainList(series: Series, notfiyRenderer = false): Promise<boolean> {
        try {
            const results = await MainListManager.findSameSeriesInMainList(series);
            if (results.length != 0) {
                for (const entry of results) {
                    try {
                        if (typeof series.merge != 'function') {
                            series = Object.assign(new Series(), series);
                        }
                        series = await series.merge(entry);
                        await MainListManager.removeSeriesFromMainList(entry, notfiyRenderer);
                    } catch (err) {
                        console.log(err);
                    }
                }
            }

            MainListManager.mainList.push(series);

            if (notfiyRenderer) {
                const seriesPackage = await new MainListPackageManager().getSeriesPackage(series, await this.getMainList());
                await FrontendController.getInstance().updateClientList(await MainListManager.getIndexFromSeries(series), seriesPackage);
            }

        } catch (err) {
            console.log(err);
            return false;
        }
        return true;
    }

    public static async finishListFilling() {
        console.log("Cleanup Mainlist");
        MainListManager.listMaintance = true;
        MainListManager.secondList = [...MainListManager.mainList];
        MainListManager.mainList = [];
        while (this.secondList.length != 0) {
            const entry = MainListManager.secondList[0];
            const oldLength = MainListManager.secondList.length;
            await entry.resetCache();
            await MainListManager.addSerieToMainList(entry);
            if (oldLength === MainListManager.secondList.length) {
                console.log("Force Remove Item | " + MainListManager.secondList.length + " left");
                MainListManager.secondList.shift();
            }
        }
        await MainListLoader.saveData(MainListManager.mainList);
        MainListManager.listMaintance = false;
    }

    public static async findSameSeriesInMainList(entry2: Series): Promise<Series[]> {
        const foundedSameSeries = [];
        for (let entry of await MainListManager.getMainList()) {
            if (entry.id === entry2.id) {
                foundedSameSeries.push(entry);
            } else {
                if (await seriesHelper.isSameSeries(entry, entry2)) {
                    foundedSameSeries.push(entry);
                }

            }
        }
        return foundedSameSeries;
    }

    public static async removeSeriesFromMainList(anime: Series, notifyRenderer = false): Promise<boolean> {
        const index = await MainListManager.getIndexFromSeries(anime);
        if (index != -1) {
            let ref = await MainListManager.getMainList();
            ref = await listHelper.removeEntrys(ref, ref[index]);
            if (notifyRenderer) {
                FrontendController.getInstance().removeEntryFromList(index);
            }
            return true;
        }
        return false;
    }

    static async getMainList(): Promise<Series[]> {
        if (!MainListManager.listLoaded) {
            MainListManager.mainList = MainListLoader.loadData();
            MainListManager.listLoaded = true;
        }
        if (this.listMaintance) {
            return MainListManager.secondList;
        } else {
            return MainListManager.mainList;
        }
    }

    public static async getIndexFromSeries(anime: Series): Promise<number> {
        return (await MainListManager.getMainList()).findIndex(x => anime.id === x.id);
    }


}
