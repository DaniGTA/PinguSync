import Series from "../objects/series";
import FrontendController from '../frontend-controller';
import seriesHelper from '../../helpFunctions/series-helper';
import listHelper from '../../helpFunctions/list-helper';
import MainListPackageManager from './main-list-package-manager';
import MainListLoader from './main-list-loader';
import SeasonComperator from '../../helpFunctions/comperators/season-comperator';
import { AbsoluteResult } from '../../helpFunctions/comperators/comperator-results.ts/comperator-result';
import ProviderComperator from '../../helpFunctions/comperators/provider-comperator';

export default class MainListManager {
    private static mainList: Series[] = [];
    private static listLoaded = false;
    private static listMaintance = false;
    private static secondList: Series[] = [];

    /**
     * Adds a new Series to the mainlist.
     * It checks if there is already a same entry and merge it.
     * @param series 
     * @param notfiyRenderer 
     */
    public static async addSerieToMainList(series: Series, notfiyRenderer = false): Promise<boolean> {
        const results = [];
        try {
            const searchResults = await MainListManager.findSameSeriesInList(series,this.mainList);
            if (searchResults.length != 0) {
                for (const entry of searchResults) {
                    try {
                        if (typeof series.merge != 'function') {
                            series = Object.assign(new Series(), series);
                        }
                       
                        const seasonResult = await SeasonComperator.compareSeasons(series, entry);
                        if (seasonResult.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE || (seasonResult.matchAble === seasonResult.matches)) {
                            console.log('Duplicate found: merging...');
                            series = await series.merge(entry, false);
                            await MainListManager.removeSeriesFromMainList(entry, notfiyRenderer);
                        }
                    } catch (err) {
                        console.log(err);
                    }
                }
            } else {
                results.push(series);
            }
            if (results.length == 0) {
                results.push(series);
            }
            if (series.lastInfoUpdate === 0) {
                console.log('[ERROR] Series no last info update! In MainList.')
            }
            console.log('[MainList] Series was added to MainList');
            MainListManager.mainList.push(...results);


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

    /**
     * Refresh cached data and clean up double entrys.
     */
    public static async finishListFilling() {
        console.log("Cleanup Mainlist");
        MainListManager.listMaintance = true;
        MainListManager.secondList = [...MainListManager.mainList];
        console.log('Temp List created');
        MainListManager.mainList = [];
        for (let index = 0; this.secondList.length != 0;) {
            const entry = this.secondList[index];
            /**
             * Reset Cache and reload it
             */
            await entry.resetCache();
            await entry.getSeason();

            await MainListManager.addSerieToMainList(entry);
            this.secondList.shift();
        }
        await MainListLoader.saveData(MainListManager.mainList);
        console.log("Finish Cleanup Mainlist");
        MainListManager.listMaintance = false;
    }

    /**
     * Search with id and it will look on other meta data if it is a same series already in the mainlist
     * @param series 
     */
    public static async findSameSeriesInMainList(series: Series): Promise<Series[]> {
        return await this.findSameSeriesInList(series,await MainListManager.getMainList());
    }

    private static async findSameSeriesInList(entry: Series, list: Series[]): Promise<Series[]>{
        console.log('[Search] Find search series in list of size: ' + list.length);
        const foundedSameSeries = [];
        for (let listEntry of list) {
            if (listEntry.id === entry.id) {
                foundedSameSeries.push(listEntry);
            } else {
                if (await seriesHelper.isSameSeries(listEntry, entry)) {
                    foundedSameSeries.push(listEntry);
                }
            }   
        }
        console.log('Found: ' + foundedSameSeries.length);
        return foundedSameSeries;
    }
    /**
     * Search with id and it will look on other meta data if it is a same series already in the mainlist
     * @param series 
     */
    public static async quickFindSameSeriesInMainList(series: Series): Promise<Series[]> {
        return await this.quickFindSameSeriesInList(series,await MainListManager.getMainList());
    }

    private static async quickFindSameSeriesInList(entry: Series, list: Series[]): Promise<Series[]>{
        console.log('[Search] Quick find search series in list of size: ' + list.length);
        const foundedSameSeries = [];
        for (const listEntry of list) {
             if (listEntry.id === entry.id) {
                foundedSameSeries.push(listEntry);
            }
            if (await ProviderComperator.simpleProviderSameIdAndSameSeasonCheck(entry, listEntry)) {
                  foundedSameSeries.push(listEntry);
            }
        }
        console.log('Found: ' + foundedSameSeries.length);
        return foundedSameSeries;
    }



    public static async removeSeriesFromMainList(series: Series, notifyRenderer = false): Promise<boolean> {
        return this.removeSeriesFromList(series, notifyRenderer, MainListManager.mainList);
    }

    public static async removeSeriesFromList(series: Series, notifyRenderer = false, list?: Series[]): Promise<boolean> {
        if (!list) {
            list = await this.getMainList();
        }
        console.log('[MainList] Remove Item in mainlist: ' + series.id);
        const index = await MainListManager.getIndexFromSeries(series);
        if (index != -1) {
            let ref = list;
            ref = await listHelper.removeEntrys(ref, ref[index]);
            if (notifyRenderer) {
                FrontendController.getInstance().removeEntryFromList(index);
            }
            return true;
        }
        return false;
    }

    /**
     * Retunrs all series but in the maintaince phase it can return dublicated entrys.
     */
    static async getMainList(): Promise<Series[]> {
        if (!MainListManager.listLoaded) {
            MainListManager.mainList = MainListLoader.loadData();
            MainListManager.listLoaded = true;
        }
        if (this.listMaintance) {
            const arr = [...MainListManager.secondList, ...MainListManager.mainList];
            console.log('TempList served: (size= ' + arr.length + ')');
            return arr;
        } else {
            return MainListManager.mainList;
        }
    }

    /**
     * Get the index number from the series in the mainlist.
     * INFO: In the maintance phase the index number can be valid very shortly.
     * @param anime 
     */
    public static async getIndexFromSeries(anime: Series): Promise<number> {
        return (await MainListManager.getMainList()).findIndex(x => anime.id === x.id);
    }


}
