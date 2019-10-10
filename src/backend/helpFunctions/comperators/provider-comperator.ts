import { ListProviderLocalData } from '../../controller/objects/list-provider-local-data';
import Series from '../../controller/objects/series';
import { SeasonError } from '../../controller/objects/transfer/season-error';
import ProviderList from '../../controller/provider-manager/provider-list';
import ComperatorResult, { AbsoluteResult } from './comperator-results.ts/comperator-result';

export default class ProviderComperator {
    public static async compareAllProviders(a: Series, b: Series): Promise<ComperatorResult> {
        const comperatorResult: ComperatorResult = new ComperatorResult();
        if (await this.hasSameListProvider(a, b)) {
            comperatorResult.matchAble += 2.5;
            for (let aProvider of a.getAllProviderLocalDatas()) {
                for (const bProvider of b.getAllProviderLocalDatas()) {
                    if (aProvider.provider === bProvider.provider) {
                        // tslint:disable-next-line: triple-equals
                        if (aProvider.id == bProvider.id) {
                            aProvider = Object.assign(new ListProviderLocalData(), aProvider);
                            comperatorResult.matches += 2.0;
                            try {
                                if (ProviderList.getExternalProviderInstance(aProvider).hasUniqueIdForSeasons) {
                                    if (comperatorResult.isAbsolute !== AbsoluteResult.ABSOLUTE_FALSE) {
                                        comperatorResult.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                                    }
                                } else if ((typeof aProvider.targetSeason === 'undefined') || (typeof bProvider.targetSeason === 'undefined')) {

                                } else if (aProvider.targetSeason === bProvider.targetSeason) {
                                    if (comperatorResult.isAbsolute !== AbsoluteResult.ABSOLUTE_FALSE) {
                                        comperatorResult.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                                    }
                                }
                                comperatorResult.matches += 0.5;
                            } catch (err) {
                                continue;
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

    /**
     * Checks if a and b have the same provider with the same id and the same season if the provider has no unique id for seasons.
     * If the check fails the function will return always false.
     * @param a will be compared with b
     * @param b will be compared with a
     */
    public static async simpleProviderSameIdAndSameSeasonCheck(a: Series, b: Series): Promise<boolean> {
        try {
            for (const aProvider of a.getListProvidersInfos()) {
                for (const bProvider of b.getListProvidersInfos()) {
                    if (aProvider.provider === bProvider.provider) {
                        if (aProvider.id === bProvider.id) {
                            if (ProviderList.getExternalProviderInstance(aProvider).hasUniqueIdForSeasons) {
                                return true;
                            } else {
                                if (aProvider.targetSeason === bProvider.targetSeason) {
                                    return true;
                                } else {
                                    const aSeason = await a.getSeason();
                                    const bSeason = await b.getSeason();
                                    if (aSeason.seasonNumber === bSeason.seasonNumber && aSeason.seasonError === SeasonError.NONE) {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
            }

        } catch (err) {
            console.error(err);
        }
        return false;
    }


    /**
     * Checks if the series have the same provider.
     * @param a
     * @param b
     */
    public static async hasSameListProvider(a: Series, b: Series): Promise<boolean> {
        try {
            for (const aProvider of a.getListProvidersInfos()) {
                for (const bProvider of b.getListProvidersInfos()) {
                    if (aProvider.provider === bProvider.provider) {
                        return true;
                    }
                }
            }

        } catch (err) {
            console.error(err);
        }
        return false;
    }
}
