import Series from '../../controller/objects/series';
import providerHelper from '../provider/provider-helper';
import { ListProviderLocalData } from '../../controller/objects/list-provider-local-data';
import ComperatorResult from './comperator-results.ts/comperator-result';

export default class ProviderComperator {
    static async compareProviders(a:Series, b:Series): Promise<ComperatorResult>{
        const comperatorResult:ComperatorResult = new ComperatorResult();
        if (await providerHelper.hasSameListProvider(a, b)) {
            comperatorResult.matchAble += 2.5;
            for (let aProvider of a.getListProvidersInfos()) {
                for (const bProvider of b.getListProvidersInfos()) {
                    if (aProvider.provider == bProvider.provider) {

                        if (aProvider.id == bProvider.id) {
                            aProvider = Object.assign(new ListProviderLocalData(), aProvider);
                            comperatorResult.matches += 2.5;
                            try {
                                if (aProvider.getProviderInstance().hasUniqueIdForSeasons) {
                                    comperatorResult.isAbsolute = true;
                                    return comperatorResult;
                                } else if (aProvider.targetSeason === bProvider.targetSeason) {
                                    comperatorResult.isAbsolute = true;
                                    return comperatorResult;
                                }
                            } catch (err) {

                            }
                        }
                    }
                }
            }
        }
        return comperatorResult;
    }
}