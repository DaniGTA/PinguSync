import Series from '../../controller/objects/series';
import providerHelper from '../provider/provider-helper';
import { ListProviderLocalData } from '../../controller/objects/list-provider-local-data';
import ComperatorResult, { AbsoluteResult } from './comperator-results.ts/comperator-result';
import ProviderList from '../../controller/provider-manager/provider-list';

export default class ProviderComperator {
    static async compareAllProviders(a: Series, b: Series): Promise<ComperatorResult> {
        const comperatorResult: ComperatorResult = new ComperatorResult();
        if (await providerHelper.hasSameListProvider(a, b)) {
            comperatorResult.matchAble += 2.5;
            for (let aProvider of a.getAllProviderLocalDatas()) {
                for (const bProvider of b.getAllProviderLocalDatas()) {
                    if (aProvider.provider == bProvider.provider) {
                        if (aProvider.id == bProvider.id) {
                            aProvider = Object.assign(new ListProviderLocalData(), aProvider);
                            comperatorResult.matches += 2.0;
                            try {
                                if (ProviderList.getExternalProviderInstance(aProvider).hasUniqueIdForSeasons) {
                                    if (comperatorResult.isAbsolute !== AbsoluteResult.ABSOLUTE_FALSE) {
                                        comperatorResult.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                                    }
                                } else if ((typeof aProvider.targetSeason == 'undefined') || (typeof bProvider.targetSeason == 'undefined')) {
                                    
                                } else if (aProvider.targetSeason === bProvider.targetSeason) {
                                    if (comperatorResult.isAbsolute !== AbsoluteResult.ABSOLUTE_FALSE) {
                                        comperatorResult.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                                    }
                                }
                                comperatorResult.matches += 0.5;
                            } catch (err) {
                                console.log(err);
                            }
                        } else {
                            comperatorResult.isAbsolute = AbsoluteResult.ABSOLUTE_FALSE;
                        }
                    }
                }
            }

        }
        return comperatorResult;
    }
}
