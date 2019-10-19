import Season from '../../controller/objects/meta/season';
import Series from '../../controller/objects/series';
import { SeasonError } from '../../controller/objects/transfer/season-error';
import ProviderLocalData from '../../controller/provider-manager/local-data/interfaces/provider-local-data';
import { ListProviderLocalData } from '../../controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../controller/provider-manager/provider-list';
import logger from '../../logger/logger';
import ComperatorResult, { AbsoluteResult } from './comperator-results.ts/comperator-result';
import { MediaType } from '../../controller/objects/meta/media-type';
import MediaTypeComperator from './media-type-comperator';

export default class ProviderComperator {
    public static async compareAllProviders(a: Series, b: Series): Promise<ComperatorResult> {
        const comperatorResult: ComperatorResult = new ComperatorResult();
        if (await this.hasSameListProvider(a, b)) {
            comperatorResult.matchAble += 2.5;
            for (let aProvider of a.getAllProviderLocalDatas()) {
                for (const bProvider of b.getAllProviderLocalDatas()) {
                    if (aProvider.provider === bProvider.provider) {
                        // tslint:disable-next-line: triple-equals
                        if (ProviderComperator.simpleProviderIdCheck(aProvider.id, bProvider.id)) {
                            aProvider = Object.assign(new ListProviderLocalData(aProvider.id), aProvider);
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
    public static async simpleProviderSameIdAndSameSeasonCheckOnSeries(a: Series, b: Series): Promise<boolean> {
        try {
            const aProviders = a.getListProvidersInfos();
            const bProviders = b.getListProvidersInfos();
            const aMediaType = await a.getMediaType();
            const bMediaType = await b.getMediaType();
            if (aMediaType === bMediaType || aMediaType === MediaType.UNKOWN || bMediaType === MediaType.UNKOWN) {
                return this.simpleProviderSameIdAndSameSeasonCheckWithSeries(aProviders, bProviders, a, b);
            }

        } catch (err) {
            logger.error(err);
        }
        return false;
    }

    // tslint:disable: triple-equals
    public static async simpleProviderSameIdAndSameSeasonCheckWithSeries(a: ProviderLocalData[], b: ProviderLocalData[], aSeries?: Series, bSeries?: Series): Promise<boolean> {
        let aSeason: Season | null = null;
        let bSeason: Season | null = null;
        for (const aProvider of a) {
            let aMediaType = aProvider.mediaType;
            if (aMediaType === MediaType.UNKOWN && aSeries) {
                aMediaType = await aSeries.getMediaType();
            }
            for (const bProvider of b) {
                if (aProvider.provider === bProvider.provider) {
                    let bMediaType = bProvider.mediaType;
                    if (bMediaType === MediaType.UNKOWN && bSeries) {
                        bMediaType = await bSeries.getMediaType();
                    }

                    try {
                        if (ProviderList.getExternalProviderInstance(aProvider).hasUniqueIdForSeasons) {
                            return ProviderComperator.simpleProviderIdCheck(aProvider.id, bProvider.id);
                        } else {
                            const mediaTypeResult = await MediaTypeComperator.comperaMediaType(aMediaType, bMediaType);
                            if (ProviderComperator.simpleProviderIdCheck(aProvider.id, bProvider.id) && mediaTypeResult.isAbsolute !== AbsoluteResult.ABSOLUTE_FALSE) {
                                if (aSeries && !aSeason) {
                                    aSeason = (await aSeries.getSeason());
                                }
                                if (bSeries && !bSeason) {
                                    bSeason = (await bSeries.getSeason());
                                }
                                if (aProvider.targetSeason === bProvider.targetSeason) {
                                    return true;
                                } else {
                                    if (aSeason && bSeason) {
                                        if (aSeason.seasonNumber === bSeason.seasonNumber && aSeason.seasonError === SeasonError.NONE) {
                                            return true;
                                        }
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        logger.warn(err);
                    }
                }
            }
        }
        return false;
    }

    public static async simpleProviderSameIdAndSameSeasonCheckWithSeason(a: ProviderLocalData[], b: ProviderLocalData[], aSeason?: Season, bSeason?: Season): Promise<boolean> {
        for (const aProvider of a) {
            for (const bProvider of b) {
                if (aProvider.provider === bProvider.provider) {
                    try {
                        if (ProviderList.getExternalProviderInstance(aProvider).hasUniqueIdForSeasons) {
                            return ProviderComperator.simpleProviderIdCheck(aProvider.id, bProvider.id);
                        } else {
                            if (ProviderComperator.simpleProviderIdCheck(aProvider.id, bProvider.id)) {
                                if (aProvider.targetSeason === bProvider.targetSeason) {
                                    return true;
                                } else {
                                    if (aSeason && bSeason) {
                                        if (aSeason.seasonNumber === bSeason.seasonNumber && aSeason.seasonError === SeasonError.NONE) {
                                            return true;
                                        }
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        logger.warn(err);
                    }
                }
            }
        }
        return false;
    }

    public static simpleProviderIdCheck(id: string | number, id2: string | number): boolean {
        return id == id2;
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
            logger.error(err);
        }
        return false;
    }
}
