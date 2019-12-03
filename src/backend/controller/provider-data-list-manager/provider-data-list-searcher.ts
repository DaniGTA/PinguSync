import ProviderDataListManager from './provider-data-list-manager';
import ProviderLocalData from '../provider-manager/local-data/interfaces/provider-local-data';
import ProviderComperator from '../../helpFunctions/comperators/provider-comperator';
import LocalDataBind from '../objects/extension/provider-extension/binding/local-data-bind';

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
        const localDataList =  ProviderDataListManager.getProviderDataListSync();
        for (const entry of localDataList) {
            if (this.isProviderLocalDataTheSearchResult(entry, pld.id, pld.provider)) {
                return entry;
            }
        }
        return null;
    }

    public static getIndexByProviderLD(pld: ProviderLocalData): number | null {
        const localDataList = ProviderDataListManager.getProviderDataListSync();
        for (const {item, index}  of localDataList.map((provider, providerIndex) => ({ item: provider, index: providerIndex }))) {
            if (this.isProviderLocalDataTheSearchResult(item, pld.id, pld.provider)) {
                return index;
            }
        }
        return null;
    }

    public static getAllBindedProvider(...bindings: LocalDataBind[]): ProviderLocalData[] {
        const localDataList: ProviderLocalData[] = ProviderDataListManager.getProviderDataListSync();
        const results: ProviderLocalData[] = [];
        for (const binding of bindings) {
            for (const localData of localDataList) {
                if (this.isProviderLocalDataTheSearchResult(localData, binding.id, binding.providerName)) {
                    results.push(localData);
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
