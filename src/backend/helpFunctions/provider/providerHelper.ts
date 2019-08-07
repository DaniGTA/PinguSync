import Series from '../../controller/objects/series';
import SameIdAndUniqueId from './sameIdAndUniqueId';
import { ListProviderLocalData } from '../../controller/objects/listProviderLocalData';

export default class ProviderHelper {
    public async checkProviderId(a: Series, b: Series): Promise<SameIdAndUniqueId> {
        for (let aProvider of a.listProviderInfos) {
            for (const bProvider of b.listProviderInfos) {
                if (aProvider.provider === bProvider.provider && aProvider.id === bProvider.id) {
                    if (aProvider.targetSeason === bProvider.targetSeason) {
                        aProvider = Object.assign(new ListProviderLocalData(), aProvider);
                        return new SameIdAndUniqueId(true, aProvider.getListProviderInstance().hasUniqueIdForSeasons);
                    }
                }
            }
        }
        return new SameIdAndUniqueId();
    }
}
