import ProviderComperator from '../../helpFunctions/comperators/provider-comperator';
import ProviderDataWithSeasonInfo from '../../helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import LocalDataBind from '../objects/extension/provider-extension/binding/local-data-bind';
import ProviderLocalData from '../provider-manager/local-data/interfaces/provider-local-data';
import ProviderDataListManager from './provider-data-list-manager';

export default class ProviderDataListSearcher {
    public static async getOneProviderLocalData(id: string | number, providerName: string): Promise<ProviderLocalData | null> {
        const localDataList = await ProviderDataListManager.getProviderDataList();
        for (const entry of localDataList) {
            if (this.isProviderLocalDataTheSearchResult(entry, id, providerName)) {
                return entry;
            }
        }
        return null;
    }

    public static getProviderLDByProviderLD(pld: ProviderLocalData): ProviderLocalData | null {
        const localDataList = ProviderDataListManager.getProviderDataListSync();
        for (const entry of localDataList) {
            if (this.isProviderLocalDataTheSearchResult(entry, pld.id, pld.provider)) {
                return entry;
            }
        }
        return null;
    }

    public static getIndexByProviderLD(pld: ProviderLocalData): number | null {
        const localDataList = ProviderDataListManager.getProviderDataListSync();
        for (const { item, index } of localDataList.map((provider, providerIndex) => ({ item: provider, index: providerIndex }))) {
            if (this.isProviderLocalDataTheSearchResult(item, pld.id, pld.provider)) {
                return index;
            }
        }
        return null;
    }

    public static getOneBindedProvider(binding: LocalDataBind): ProviderLocalData {
        const result = this.getAllBindedProvider(binding);
        return result[0];
    }

    public static getAllBindedProvider(...bindings: LocalDataBind[]): ProviderLocalData[] {
        const localDataList: ProviderLocalData[] = ProviderDataListManager.getProviderDataListSync();
        const results: ProviderLocalData[] = [];
        for (const binding of bindings) {
            const len = localDataList.length;
            for (let index = 0; index < len; index++) {
                const localData = localDataList[index];
                if (this.isProviderLocalDataTheSearchResult(localData, binding.id, binding.providerName)) {
                    results.push(localData);
                    break;
                }
            }
        }
        return results;
    }

    public static getAllBindedProviderWithSeasonInfo(...bindings: LocalDataBind[]): ProviderDataWithSeasonInfo[] {
        const localDataList: ProviderLocalData[] = ProviderDataListManager.getProviderDataListSync();
        const results: ProviderDataWithSeasonInfo[] = [];
        for (const binding of bindings) {
            for (const localData of localDataList) {
                if (this.isProviderLocalDataTheSearchResult(localData, binding.id, binding.providerName)) {
                    results.push(new ProviderDataWithSeasonInfo(localData, binding.targetSeason));
                    break;
                }
            }
        }
        return results;
    }

    public static isProviderLocalDataTheSearchResult(entry: ProviderLocalData, id: string | number, providerName: string): boolean {
        return (ProviderComperator.simpleProviderIdCheck(entry.id, id) && providerName === entry.provider);
    }
}
