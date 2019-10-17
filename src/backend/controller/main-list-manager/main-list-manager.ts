import { AbsoluteResult } from '../../helpFunctions/comperators/comperator-results.ts/comperator-result';
import SeasonComperator from '../../helpFunctions/comperators/season-comperator';
import listHelper from '../../helpFunctions/list-helper';
import logger from '../../logger/logger';
import FrontendController from '../frontend-controller';
import Series from '../objects/series';
import MainListLoader from './main-list-loader';
import MainListPackageManager from './main-list-package-manager';
import MainListSearcher from './main-list-searcher';
export default class MainListManager {

    /**
     * Adds a new Series to the mainlist.
     * It checks if there is already a same entry and merge it.
     * @param series
     * @param notfiyRenderer
     */
    public static async addSerieToMainList(series: Series, notfiyRenderer = false): Promise<boolean> {
        await this.checkIfListIsLoaded();
        const searcher = new MainListSearcher();
        const results = [];
        try {
            const searchResults = await searcher.findSameSeriesInList(series, this.mainList);
            if (searchResults.length !== 0) {
                for (const entry of searchResults) {
                    try {
                        if (typeof series.merge !== 'function') {
                            series = Object.assign(new Series(), series);
                        }

                        const seasonResult = await SeasonComperator.compareSeasons(series, entry);
                        if (seasonResult.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE || (seasonResult.matchAble === seasonResult.matches)) {
                            logger.log('info', '[MainList] Duplicate found: merging...');
                            series = await series.merge(entry, false);
                            await MainListManager.removeSeriesFromMainList(entry, notfiyRenderer);
                        }
                    } catch (err) {
                        logger.log('info', err);
                    }
                }
            } else {
                results.push(series);
            }
            if (results.length === 0) {
                results.push(series);
            }
            if (series.lastInfoUpdate === 0) {
                logger.error('[ERROR] Series no last info update! In MainList.');
            }
            logger.log('info', '[MainList] Series was added to MainList');
            MainListManager.mainList.push(...results);


            if (notfiyRenderer) {
                const seriesPackage = await new MainListPackageManager().getSeriesPackage(series, await this.getMainList());
                await FrontendController.getInstance().updateClientList(await MainListManager.getIndexFromSeries(series), seriesPackage);
            }

        } catch (err) {
            logger.error(err);
            return false;
        }
        return true;
    }

    public static async updateSerieInList(series: Series) {
        logger.info('[MainList] Update series in mainlist ' + series.id);
        const index = await this.getIndexFromSeries(series);
        if (!MainListManager.listMaintance) {
            const tempSeries = await MainListManager.mainList[index].merge(series);
            tempSeries.id = series.id;
            MainListManager.mainList[index] = tempSeries;
        } else {
            const tempSeries = await MainListManager.secondList[index].merge(series);
            tempSeries.id = series.id;
            MainListManager.secondList[index] = tempSeries;
        }
    }

    /**
     * Refresh cached data and clean up double entrys.
     */
    public static async finishListFilling() {
        logger.log('info', '[MainList] Cleanup Mainlist');
        MainListManager.listMaintance = true;
        MainListManager.secondList = [...MainListManager.mainList];
        logger.log('info', '[MainList] Temp List created');
        MainListManager.mainList = [];
        for (const index = 0; this.secondList.length !== 0;) {
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
        logger.log('info', '[MainList] Finish Cleanup Mainlist');
        MainListManager.listMaintance = false;
    }


    public static async removeSeriesFromMainList(series: Series, notifyRenderer = false): Promise<boolean> {
        return this.removeSeriesFromList(series, notifyRenderer, MainListManager.mainList);
    }

    public static async removeSeriesFromList(series: Series, notifyRenderer = false, list?: Series[]): Promise<boolean> {
        await this.checkIfListIsLoaded();
        if (!list) {
            list = await this.getMainList();
        }
        logger.log('info', '[MainList] Remove Item in mainlist: ' + series.id);
        const index = await MainListManager.getIndexFromSeries(series);
        if (index !== -1) {
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
    public static async getMainList(): Promise<Series[]> {
        await this.checkIfListIsLoaded();
        if (this.listMaintance) {
            const arr = [...MainListManager.secondList, ...MainListManager.mainList];
            logger.log('info', '[MainList] TempList served: (size= ' + arr.length + ')');
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
        return (await MainListManager.getMainList()).findIndex((x) => anime.id === x.id);
    }

    public static async requestSaveMainList() {
        MainListLoader.saveData(await this.getMainList());
    }

    private static mainList: Series[] = [];
    private static listLoaded = false;
    private static listMaintance = false;
    private static secondList: Series[] = [];

    private static async checkIfListIsLoaded() {
        if (!MainListManager.listLoaded) {
            MainListManager.mainList = MainListLoader.loadData();
            MainListManager.listLoaded = true;
        }
    }
}
