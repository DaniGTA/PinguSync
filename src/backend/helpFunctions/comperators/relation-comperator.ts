import { isNumber } from 'util';
import Series from '../../controller/objects/series';
import ComperatorResult, { AbsoluteResult } from './comperator-results.ts/comperator-result';
import ProviderComperator from './provider-comperator';

export default class RelationComperator {
    /**
     * Checks if `a` is a alternative to `b` and it
     * checks if `b` is a alternative to `a`.
     * @param a series a
     * @param b series b
     */
    public static isAlternativeSeries(a: Series, b: Series): ComperatorResult {
        const comperatorResult = new ComperatorResult();

        if (ProviderComperator.hasSameListProvider(a, b)) {
            for (const aProviderLocalData of a.getAllProviderLocalDatas()) {
                for (const bProviderLocalData of b.getAllProviderLocalDatas()) {
                    if (aProviderLocalData.provider === bProviderLocalData.provider) {
                        if (isNumber(bProviderLocalData.id)) {
                            if (aProviderLocalData.alternativeIds.includes(bProviderLocalData.id)) {
                                comperatorResult.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                                return comperatorResult;
                            }
                        }
                        if (isNumber(aProviderLocalData.id)) {
                            if (bProviderLocalData.alternativeIds.includes(aProviderLocalData.id)) {
                                comperatorResult.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                                return comperatorResult;
                            }
                        }
                    }
                }
            }
        }

        return comperatorResult;
    }
}
