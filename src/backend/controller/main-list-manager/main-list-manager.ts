import EpisodeMappingHelper from '../../helpFunctions/episode-mapping-helper/episode-mapping-helper';
import listHelper from '../../helpFunctions/list-helper';
import logger from '../../logger/logger';
import { MergeTypes } from '../objects/merge-types';
import Series from '../objects/series';
import MainListLoader from './main-list-loader';
import MainListSaver from './main-list-saver';
import MainListSearcher from './main-list-searcher';
export default class MainListManager {

    /**
     * Adds a new Series to the mainlist.
     * It checks if there is already a same entry and merge it.
     * @param series
     * @param notfiyRenderer
     */
    public static async addSerieToMainList(series: Series, notfiyRenderer = false): Promise<boolean> {
        this.checkIfListIsLoaded();
        const searcher = new MainListSearcher();
        const results = [];
        if (series.getAllProviderBindings().length !== 0) {
            try {
                const searchResults = await searcher.findSameSeriesInList(series, this.mainList);
                if (searchResults.length !== 0) {
                    for (const entry of searchResults) {
                        try {
                            if (series.id === entry.id) {
                                await this.updateSerieInList(series);
                                return true;
                            }
                            if (typeof series.merge !== 'function') {
                                series = Object.assign(new Series(), series);
                            }

                            logger.log('info', '[MainList] Duplicate found: merging...');
                            series = await series.merge(entry, false);
                            MainListManager.removeSeriesFromMainList(entry, notfiyRenderer);
                        } catch (err) {
                            logger.error(err);
                        }
                    }
                } else {
                    const instance = await EpisodeMappingHelper.getEpisodeMappings(series);
                    series.addEpisodeBindingPools(...instance);
                    results.push(series);
                }
                if (results.length === 0) {
                    results.push(series);
                }
                if (series.lastInfoUpdate === 0) {
                    logger.error('[ERROR] Series no last info update! In MainList.');
                }
                logger.log('info', '[MainList] Series was added to MainList. New list size: ' + this.mainList.length);
                MainListManager.mainList.push(...results);
            } catch (err) {
                logger.error(err);
                return false;
            }
            return true;
        } else {
            return false;
        }
    }

    public static async updateSerieInList(series: Series): Promise<void> {
        logger.info('[MainList] Update series in mainlist ' + series.id);
        const mainIndex = this.getIndexFromSeries(series, MainListManager.mainList);
        if (mainIndex !== -1) {
            let outdatedSeries = MainListManager.mainList[mainIndex];
            if (typeof outdatedSeries.merge !== 'function') {
                outdatedSeries = Object.assign(new Series(), outdatedSeries);
            }
            const tempSeries = await outdatedSeries.merge(series, true, MergeTypes.UPDATE);
            tempSeries.id = series.id;
            MainListManager.mainList[mainIndex] = tempSeries;
        }
        if (MainListManager.listMaintance) {
            const seconListIndex = this.getIndexFromSeries(series, MainListManager.secondList);
            if (seconListIndex !== -1) {
                let outdatedSecondListSeries = MainListManager.secondList[seconListIndex];
                if (typeof outdatedSecondListSeries.merge !== 'function') {
                    outdatedSecondListSeries = Object.assign(new Series(), outdatedSecondListSeries);
                }
                const tempSecondListSeries = await outdatedSecondListSeries.merge(series, true, MergeTypes.UPDATE);
                tempSecondListSeries.id = series.id;
                MainListManager.secondList[seconListIndex] = tempSecondListSeries;
            }
        }
    }

    /**
     * Refresh cached data and clean up double entrys.
     */
    public static async finishListFilling(): Promise<void> {
        if (MainListManager.listMaintance === true) {
            return;
        }
        logger.log('info', '[MainList] Cleanup Mainlist. Current list size: ' + this.mainList.length);

        MainListManager.listMaintance = true;
        try {
            MainListManager.secondList = [...MainListManager.mainList];
            logger.log('info', '[MainList] Temp List created. Temp list size: ' + this.secondList.length);
            MainListManager.mainList = [];
            for (const index = 0; this.secondList.length !== 0;) {
                try {
                    const entry = this.secondList[index];
                    /**
                     * Reset Cache and reload it
                     */
                    entry.resetCache();
                    try {
                        await entry.getSeason();
                    } catch (ignore) {
                        logger.debug(ignore);
                    }
                    await MainListManager.addSerieToMainList(entry);
                } catch (err) {
                    logger.error(err);
                }
                if (this.secondList.length !== 0) {
                    this.secondList.shift();
                }
            }
            MainListSaver.saveMainList(MainListManager.mainList);
            logger.log('info', '[MainList] Finish Cleanup Mainlist. Current list size: ' + this.mainList.length);
        } catch (err) {
            logger.error('Error at MainListManager.finishListFilling');
            logger.error(err);
        }
        MainListManager.listMaintance = false;
    }


    public static removeSeriesFromMainList(series: Series, notifyRenderer = false): boolean {
        let result = false;
        if (this.listMaintance) {
            const result1 = this.removeSeriesFromList(series, notifyRenderer, MainListManager.mainList);
            const result2 = this.removeSeriesFromList(series, notifyRenderer, MainListManager.secondList);
            return (result1 || result2);
        } else {
            result = this.removeSeriesFromList(series, notifyRenderer, MainListManager.mainList);
        }
        return result;
    }

    public static removeSeriesFromList(series: Series, notifyRenderer = false, list?: Series[]): boolean {
        this.checkIfListIsLoaded();
        if (!list) {
            list = this.getMainList();
        }
        logger.log('info', '[MainList] Remove Item in mainlist: ' + series.id);
        const index = MainListManager.getIndexFromSeries(series, list);
        if (index !== -1) {
            const oldSize = list.length;
            let ref = list;
            ref = listHelper.removeEntrys(ref, ref[index]);
            this.requestSaveMainList();
            return oldSize !== ref.length;
        }
        return false;
    }

    /**
     * Retunrs all series but in the maintaince phase it can return dublicated entrys.
     */
    public static getMainList(): Series[] {
        this.checkIfListIsLoaded();
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
    public static getIndexFromSeries(anime: Series, seriesList?: Series[] | readonly Series[]): number {
        if (seriesList) {
            return (seriesList).findIndex((x) => anime.id === x.id);
        } else {
            return (MainListManager.getMainList()).findIndex((x) => anime.id === x.id);
        }
    }

    public static requestSaveMainList(): void {
        MainListSaver.saveMainList(this.getMainList());
    }

    private static mainList: Series[] = [];
    private static listLoaded = false;
    private static listMaintance = false;
    private static secondList: Series[] = [];

    private static checkIfListIsLoaded(): void {
        if (!MainListManager.listLoaded) {
            MainListManager.mainList = MainListLoader.loadData();
            MainListManager.listLoaded = true;
        }
    }
}
