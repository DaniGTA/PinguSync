import ProviderComperator from '../../../helpFunctions/comperators/provider-comperator';
import ProviderLocalDataWithSeasonInfo from '../../../helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import LocalDataBind from '../../objects/extension/provider-extension/binding/local-data-bind';
import ProviderLocalData from '../provider-manager/local-data/interfaces/provider-local-data';
import ProviderDataListManager from './provider-data-list-manager';

export default class ProviderDataListSearcher {
    public static getOneProviderLocalData(id: string | number, providerName: string): ProviderLocalData | null {
        const localDataList = ProviderDataListManager.getProviderDataList();
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
        const len = localDataList.length;
        for (const binding of bindings) {
            if (this.isProviderLocalDataSavedIndexValid(localDataList, binding)) {
                results.push(localDataList[binding.lastIndex as number]);
            } else {
                for (let index = 0; index < len; index++) {
                    const localData = localDataList[index];
                    if (this.isProviderLocalDataTheSearchResult(localData, binding.id, binding.providerName)) {
                        binding.lastIndex = index;
                        results.push(localData);
                        break;
                    }
                }
            }
        }
        return results;
    }

    public static getAllBindedProviderLocalDataWithSeasonInfo(...bindings: LocalDataBind[]): ProviderLocalDataWithSeasonInfo[] {
        const localDataList: ProviderLocalData[] = ProviderDataListManager.getProviderDataListSync();
        const results: ProviderLocalDataWithSeasonInfo[] = [];
        const len = localDataList.length;
        for (const binding of bindings) {
            if (this.isProviderLocalDataSavedIndexValid(localDataList, binding)) {
                results.push(new ProviderLocalDataWithSeasonInfo(localDataList[binding.lastIndex as number], binding.targetSeason));
            } else {
                for (let index = 0; index < len; index++) {
                    const localData = localDataList[index];
                    if (this.isProviderLocalDataTheSearchResult(localData, binding.id, binding.providerName)) {
                        binding.lastIndex = index;
                        results.push(new ProviderLocalDataWithSeasonInfo(localData, binding.targetSeason));
                        break;
                    }
                }
            }
        }
        return results;
    }

    public static isProviderLocalDataTheSearchResult(entry: ProviderLocalData | undefined, id: string | number, providerName: string): boolean {
        return (entry !== undefined && ProviderComperator.simpleProviderIdCheck(entry.id, id) && providerName === entry.provider);
    }

    private static isProviderLocalDataSavedIndexValid(localDataList: ProviderLocalData[], binding: LocalDataBind): boolean {
        if (binding.lastIndex !== undefined) {
            return this.isProviderLocalDataTheSearchResult(localDataList[binding.lastIndex], binding.id, binding.providerName);
        }
        return false;
    }
}
