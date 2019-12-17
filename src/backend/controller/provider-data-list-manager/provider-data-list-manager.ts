import listHelper from '../../helpFunctions/list-helper';
import logger from '../../logger/logger';
import { InfoProviderLocalData } from '../provider-manager/local-data/info-provider-local-data';
import ProviderLocalData from '../provider-manager/local-data/interfaces/provider-local-data';
import { ListProviderLocalData } from '../provider-manager/local-data/list-provider-local-data';
import ProviderDataListLoader from './provider-data-list-loader';
import ProviderDataListSearcher from './provider-data-list-searcher';

export default class ProviderDataListManager {

    /**
     * Adds a new provider local data to the mainlist.
     * It checks if there is already a same entry and merge it.
     * @param provider
     * @param notfiyRenderer
     */
    public static async addProviderLocalDataToMainList(provider: ProviderLocalData, notfiyRenderer = false): Promise<boolean> {
        try {
            const alreadyExistingEntry = ProviderDataListSearcher.getProviderLDByProviderLD(provider);
            if (alreadyExistingEntry != null) {
                await this.updateSerieInList(provider);
                return true;
            } else {
                this.providerDataList.push(provider);
                return true;
            }
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    public static async updateSerieInList(provider: ProviderLocalData) {
        const providerIndex = ProviderDataListSearcher.getIndexByProviderLD(provider);
        if (providerIndex != null) {
            const oldProvider = this.providerDataList[providerIndex];
            if (oldProvider instanceof ListProviderLocalData && provider instanceof ListProviderLocalData) {
                this.providerDataList[providerIndex] = await ListProviderLocalData.mergeProviderInfos(provider, oldProvider);
            } else if (oldProvider instanceof InfoProviderLocalData && provider instanceof InfoProviderLocalData) {
                this.providerDataList[providerIndex] = await InfoProviderLocalData.mergeProviderInfos(provider, oldProvider);
            } else {
                logger.error('[ProviderList] Failed update: Not same instance')
            }
        }
    }

    /**
     * Refresh cached data and clean up double entrys.
     */
    public static async finishListFilling() {
        logger.log('info', '[ProviderList] Cleanup Mainlist');
        ProviderDataListManager.listMaintance = true;
        ProviderDataListManager.listMaintance = false;
    }


    public static async removeSeriesFromMainList(providerLocalData: ProviderLocalData, notifyRenderer = false): Promise<boolean> {
        let result = false;
        if (this.listMaintance) {
            const result1 = await this.removeSeriesFromList(providerLocalData, notifyRenderer, ProviderDataListManager.providerDataList);
            const result2 = await this.removeSeriesFromList(providerLocalData, notifyRenderer, ProviderDataListManager.secondList);
            return (result1 || result2);
        } else {
            result = await this.removeSeriesFromList(providerLocalData, notifyRenderer, ProviderDataListManager.providerDataList);
        }
        return result;
    }

    public static async removeSeriesFromList(provider: ProviderLocalData, notifyRenderer = false, list?: ProviderLocalData[]): Promise<boolean> {
        await this.checkIfListIsLoaded();
        if (!list) {
            list = await this.getProviderDataList();
        }
        logger.log('info', '[ProviderList] Remove Item in mainlist: ' + provider.id + '(' + provider.provider + ')');
        const index = await ProviderDataListManager.getIndexFromProviderLocalData(provider, list);
        if (index !== -1) {
            const oldSize = list.length;
            let ref = list;
            ref = await listHelper.removeEntrys(ref, ref[index]);
            if (notifyRenderer) {
                // FrontendController.getInstance().removeEntryFromList(index);
            }
            await this.requestSaveProviderList();
            return oldSize !== ref.length;
        }
        return false;
    }

    /**
     * Retunrs all provider local data but in the maintaince phase it can return dublicated entrys.
     */
    public static async getProviderDataList(): Promise<ProviderLocalData[]> {
        this.checkIfListIsLoaded();
        if (this.listMaintance) {
            const arr = [...ProviderDataListManager.secondList, ...ProviderDataListManager.providerDataList];
            logger.log('info', '[ProviderList] TempList served: (size= ' + arr.length + ')');
            return arr;
        } else {
            return ProviderDataListManager.providerDataList;
        }
    }

    /**
     * Retunrs all series but in the maintaince phase it can return dublicated entrys.
     */
    public static getProviderDataListSync(): ProviderLocalData[] {
        this.checkIfListIsLoaded();
        if (this.listMaintance) {
            const arr = [...ProviderDataListManager.secondList, ...ProviderDataListManager.providerDataList];
            logger.log('info', '[ProviderList] TempList served: (size= ' + arr.length + ')');
            return arr;
        } else {
            return ProviderDataListManager.providerDataList;
        }
    }

    /**
     * Get the index number from the series in the mainlist.
     * INFO: In the maintance phase the index number can be valid very shortly.
     * @param anime
     */
    public static async getIndexFromProviderLocalData(anime: ProviderLocalData, seriesList?: ProviderLocalData[] | readonly ProviderLocalData[]): Promise<number> {
        if (seriesList) {
            return (seriesList).findIndex((x) => anime.id === x.id);
        } else {
            return (await ProviderDataListManager.getProviderDataList()).findIndex((x) => anime.id === x.id);
        }
    }

    public static async requestSaveProviderList() {
        ProviderDataListLoader.saveData(await this.getProviderDataList());
    }

    private static providerDataList: ProviderLocalData[] = [];
    private static listLoaded = false;
    private static listMaintance = false;
    private static secondList: ProviderLocalData[] = [];

    private static checkIfListIsLoaded() {
        if (!ProviderDataListManager.listLoaded) {
            ProviderDataListManager.providerDataList = ProviderDataListLoader.loadData();
            ProviderDataListManager.listLoaded = true;
        }
    }
}