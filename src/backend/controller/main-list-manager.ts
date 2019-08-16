import Series from "./objects/series";
import FrontendController from './frontend-controller';
import seriesHelper from '../helpFunctions/series-helper';
import listHelper from '../helpFunctions/list-helper';
import MainListPackageManager from './main-list-package-manager';

export default class MainListManager {
    private static mainList: Series[] = [];
    public static listLoaded = false;

    public static async addSerieToMainList(series: Series, notfiyRenderer = false): Promise<boolean> {
        try {
            const results = await MainListManager.findSameSeriesInMainList(series);
            if (results.length != 0) {
                for (const entry of results) {
                    try {
                        series = await series.merge(entry);
                        await MainListManager.removeSeriesFromMainList(entry, notfiyRenderer);
                    } catch (err) {
                        console.log(err);
                    }
                }
            }

            MainListManager.mainList.push(series);

            if (notfiyRenderer) {
                const seriesPackage = await new MainListPackageManager().getSeriesPackage(series,this.getMainList());
                await FrontendController.getInstance().updateClientList(await MainListManager.getIndexFromSeries(series), seriesPackage);
            }

        } catch (err) {
            console.log(err);
            return false;
        }
        return true;
    }

    public static async findSameSeriesInMainList(entry2: Series): Promise<Series[]> {
        const foundedSameSeries = [];
        for (let entry of MainListManager.mainList) {
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
            MainListManager.mainList = await listHelper.removeEntrys(MainListManager.mainList, MainListManager.mainList[index]);
            if (notifyRenderer) {
                FrontendController.getInstance().removeEntryFromList(index);
            }
            return true;
        }
        return false;
    }
    
    public static getMainList(): Series[] {
        return MainListManager.mainList;
    }

    public static async getIndexFromSeries(anime: Series): Promise<number> {
        return MainListManager.getMainList().findIndex(x => anime.id === x.id);
    }

   
}