import listHelper from '../../../helpFunctions/list-helper';
import logger from '../../../logger/logger';
import SeriesProviderExtensionInstanceCheck from '../../objects/extension/provider-extension/series-provider-extension-instance-check';
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
    public static async addProviderLocalDataToMainList(provider: ProviderLocalData, notfiyRenderer = false): Promise<number | undefined> {
        try {
            const alreadyExistingEntry = ProviderDataListSearcher.getProviderLDByProviderLD(provider);
            if (alreadyExistingEntry != null) {
                await this.updateProviderInList(provider);
                return undefined;
            } else {
                return this.providerDataList.push(provider);
            }
        } catch (err) {
            logger.error(err);
            return undefined;
        }
    }

    /**
     * need test.
     * @param provider
     */
    public static async updateProviderInList(provider: ProviderLocalData): Promise<void> {
        const providerIndex = ProviderDataListSearcher.getIndexByProviderLD(provider);
        if (providerIndex != null) {
            const oldProvider = this.providerDataList[providerIndex];
            if (SeriesProviderExtensionInstanceCheck.instanceOfListProviderLocalData(oldProvider) &&
                SeriesProviderExtensionInstanceCheck.instanceOfListProviderLocalData(provider)) {
                const lpld = await ListProviderLocalData.mergeProviderInfos(provider as ListProviderLocalData, oldProvider as ListProviderLocalData);
                this.providerDataList[providerIndex] = lpld;
            } else if (SeriesProviderExtensionInstanceCheck.instanceOfInfoProviderLocalData(oldProvider) &&
                SeriesProviderExtensionInstanceCheck.instanceOfInfoProviderLocalData(provider)) {
                const ipld = await InfoProviderLocalData.mergeProviderInfos(provider as InfoProviderLocalData, oldProvider as InfoProviderLocalData);
                this.providerDataList[providerIndex] = ipld;
            } else {
                logger.error('[ProviderList] Failed update: Not same instance');
            }
        }
    }

    /**
     * Refresh cached data and clean up double entrys.
     */
    public static finishListFilling(): void {
        logger.log('info', '[ProviderList] Cleanup Mainlist');
        ProviderDataListManager.listMaintance = true;
        ProviderDataListManager.listMaintance = false;
    }


    public static removeSeriesFromMainList(providerLocalData: ProviderLocalData, notifyRenderer = false): boolean {
        let result = false;
        if (this.listMaintance) {
            const result1 = this.removeSeriesFromList(providerLocalData, notifyRenderer, ProviderDataListManager.providerDataList);
            const result2 = this.removeSeriesFromList(providerLocalData, notifyRenderer, ProviderDataListManager.secondList);
            return (result1 || result2);
        } else {
            result = this.removeSeriesFromList(providerLocalData, notifyRenderer, ProviderDataListManager.providerDataList);
        }
        return result;
    }

    public static removeSeriesFromList(provider: ProviderLocalData, notifyRenderer = false, list?: ProviderLocalData[]): boolean {
        this.checkIfListIsLoaded();
        if (!list) {
            list = this.getProviderDataList();
        }
        logger.log('info', '[ProviderList] Remove Item in mainlist: ' + provider.id + '(' + provider.provider + ')');
        const index = ProviderDataListManager.getIndexFromProviderLocalData(provider, list);
        if (index !== -1) {
            const oldSize = list.length;
            let ref = list;
            ref = listHelper.removeEntrys(ref, ref[index]);
            if (notifyRenderer) {
                // FrontendController.getInstance().removeEntryFromList(index);
            }
            this.requestSaveProviderList();
            return oldSize !== ref.length;
        }
        return false;
    }

    /**
     * Retunrs all provider local data but in the maintaince phase it can return dublicated entrys.
     */
    public static getProviderDataList(): ProviderLocalData[] {
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
    public static getIndexFromProviderLocalData(anime: ProviderLocalData, seriesList?: ProviderLocalData[] | readonly ProviderLocalData[]): number {
        if (seriesList) {
            return (seriesList).findIndex((x) => anime.id === x.id);
        } else {
            return (ProviderDataListManager.getProviderDataList()).findIndex((x) => anime.id === x.id);
        }
    }

    public static requestSaveProviderList(): void {
        ProviderDataListLoader.saveData(this.getProviderDataList());
    }

    private static providerDataList: ProviderLocalData[] = [];
    private static listLoaded = false;
    private static listMaintance = false;
    private static secondList: ProviderLocalData[] = [];

    private static checkIfListIsLoaded(): void {
        if (!ProviderDataListManager.listLoaded) {
            ProviderDataListManager.providerDataList = ProviderDataListLoader.loadData();
            ProviderDataListManager.listLoaded = true;
        }
    }
}
