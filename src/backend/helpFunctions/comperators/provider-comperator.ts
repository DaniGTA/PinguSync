import Series from '../../controller/objects/series';
import providerHelper from '../provider/provider-helper';
import { ListProviderLocalData } from '../../controller/objects/list-provider-local-data';
import ComperatorResult, { AbsoluteResult } from './comperator-results.ts/comperator-result';

export default class ProviderComperator {
    static async compareListProviders(a: Series, b: Series): Promise<ComperatorResult> {
        const comperatorResult: ComperatorResult = new ComperatorResult();
        if (await providerHelper.hasSameListProvider(a, b)) {
            comperatorResult.matchAble += 2.5;
            for (let aProvider of a.getListProvidersInfos()) {
                for (const bProvider of b.getListProvidersInfos()) {
                    if (aProvider.provider == bProvider.provider) {
                        if (aProvider.id == bProvider.id) {
                            aProvider = Object.assign(new ListProviderLocalData(), aProvider);
                            comperatorResult.matches += 2.0;
                            try {
                                if (aProvider.getProviderInstance().hasUniqueIdForSeasons) {
                                    comperatorResult.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                                    return comperatorResult;
                                } else if ((typeof aProvider.targetSeason == 'undefined') || (typeof bProvider.targetSeason == 'undefined')) {
                                    
                                } else if (aProvider.targetSeason === bProvider.targetSeason) {
                                    comperatorResult.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                                    return comperatorResult;
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
    static async compareInfoProviders(a: Series, b: Series): Promise<ComperatorResult> {
        const comperatorResult: ComperatorResult = new ComperatorResult();
        if (await providerHelper.hasSameInfoProvider(a.getInfoProvidersInfos(), b.getInfoProvidersInfos())) {
            comperatorResult.matchAble += 2.5;
            for (let aProvider of a.getInfoProvidersInfos()) {
                for (const bProvider of b.getInfoProvidersInfos()) {
                    if (aProvider.provider == bProvider.provider) {
                        if (aProvider.id == bProvider.id) {
                            aProvider = Object.assign(new ListProviderLocalData(), aProvider);
                            comperatorResult.matches += 2.5;
                            try {
                                if (aProvider.getProviderInstance().hasUniqueIdForSeasons) {
                                    comperatorResult.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                                    return comperatorResult;
                                } else if ((typeof a.getSeason() == 'undefined') || (typeof b.getSeason() == 'undefined')) {
                                    
                                } else if ( a.getSeason()  === b.getSeason()) {
                                    comperatorResult.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                                    return comperatorResult;
                                }
                                comperatorResult.matches += 0.5;
                            } catch (err) {
                                console.log(err);
                            }
                        }
                    }
                }
            }
        }
        return comperatorResult;
    }
}
