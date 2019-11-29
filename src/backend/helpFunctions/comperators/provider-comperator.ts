import { MediaType } from '../../controller/objects/meta/media-type';
import Season from '../../controller/objects/meta/season';
import Series from '../../controller/objects/series';
import { SeasonError } from '../../controller/objects/transfer/season-error';
import { ProviderInfoStatus } from '../../controller/provider-manager/local-data/interfaces/provider-info-status';
import ProviderLocalData from '../../controller/provider-manager/local-data/interfaces/provider-local-data';
import { ListProviderLocalData } from '../../controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../controller/provider-manager/provider-list';
import logger from '../../logger/logger';
import ComperatorResult, { AbsoluteResult } from './comperator-results.ts/comperator-result';
import MediaTypeComperator from './media-type-comperator';
import { Provider } from 'electron';
import SeasonComperator from './season-comperator';

export default class ProviderComperator {

    public static async compareAllProviders(a: Series, b: Series): Promise<ComperatorResult> {
        const comperatorResults: ComperatorResult[] = [];

        const allAProviderLocalDatas = a.getAllProviderLocalDatas();
        const allBProviderLocalDatas = b.getAllProviderLocalDatas();

        for (const provider of allAProviderLocalDatas) {
            try {
                const result = this.compareProviderAWithSameProvider(provider, ...allBProviderLocalDatas);
                comperatorResults.push(result);
                // tslint:disable-next-line: no-empty
            } catch (ignore) {
            }
        }

        return this.calculateResult(...comperatorResults);
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


    /**
     * Checks if the series have the same provider.
     * @param a
     * @param b
     */
    public static bothProviderFromTheSameSeason(a: ProviderLocalData, b: ProviderLocalData, seriesSeasonNumber?: number): boolean {
        try {
            const providerASeasonNumber = a.targetSeason;
            const providerBSeasonNumber = b.targetSeason;
            return SeasonComperator.isSameSeasonNumber(providerASeasonNumber, providerBSeasonNumber, seriesSeasonNumber);
        } catch (err) {
            logger.error(err);
        }
        return false;
    }

    /**
     * Checks if the series have the same provider.
     * @param a
     * @param b
     */
    public static hasSameListProvider(a: Series, b: Series): boolean {
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

    public static simpleProviderIdCheck(id: string | number, id2: string | number): boolean {
        return id == id2;
    }

    private static calculateResult(...results: ComperatorResult[]): ComperatorResult {
        const finalResult = new ComperatorResult();
        const absoluteResults: AbsoluteResult[] = [];
        for (const result of results) {
            finalResult.matchAble += result.matchAble;
            finalResult.matches += result.matches;
            if (result.isAbsolute !== AbsoluteResult.ABSOLUTE_NONE) {
                absoluteResults.push(result.isAbsolute);
            }
        }
        if (absoluteResults.includes(AbsoluteResult.ABSOLUTE_FALSE)) {
            finalResult.isAbsolute = AbsoluteResult.ABSOLUTE_FALSE;
        } else if (absoluteResults.includes(AbsoluteResult.NOT_ABSOLUTE_TRUE)) {
            finalResult.isAbsolute = AbsoluteResult.ABSOLUTE_NONE;
        } else if (absoluteResults.includes(AbsoluteResult.ABSOLUTE_TRUE)) {
            finalResult.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
        }

        return finalResult;
    }

    private static compareProviderAWithSameProvider(providerA: ProviderLocalData, ...providers: ProviderLocalData[]): ComperatorResult {
        const result = providers.find((x) => x.provider === providerA.provider);
        if (result) {
            return this.compareProviderAWithProviderB(providerA, result);
        }
        throw new Error('provider cant be compared (other series dont have this provider)');
    }

    private static compareProviderAWithProviderB(providerA: ProviderLocalData, providerB: ProviderLocalData): ComperatorResult {
        const comperatorResult: ComperatorResult = new ComperatorResult();
        comperatorResult.matchAble += 2.5;
        if (ProviderComperator.simpleProviderIdCheck(providerA.id, providerB.id)) {
            providerA = Object.assign(new ListProviderLocalData(providerA.id), providerA);
            comperatorResult.matches += 2.0;
            try {
                if (ProviderList.getExternalProviderInstance(providerA).hasUniqueIdForSeasons) {
                    comperatorResult.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                    // tslint:disable-next-line: no-empty
                } else if ((typeof providerA.targetSeason === 'undefined') || (typeof providerB.targetSeason === 'undefined')) {

                } else if (providerA.targetSeason === providerB.targetSeason) {
                    comperatorResult.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                }
                comperatorResult.matches += 0.5;
                // tslint:disable-next-line: no-empty
            } catch (err) { }
        } else {
            if (providerA.infoStatus !== ProviderInfoStatus.ONLY_ID && providerB.infoStatus !== ProviderInfoStatus.ONLY_ID) {
                comperatorResult.isAbsolute = AbsoluteResult.ABSOLUTE_FALSE;
            } else {
                comperatorResult.isAbsolute = AbsoluteResult.NOT_ABSOLUTE_TRUE;
            }
        }
        if (this.isProviderBARelationOfProviderA(providerA, providerB)) {
            comperatorResult.isAbsolute = AbsoluteResult.ABSOLUTE_FALSE;
        }
        return comperatorResult;
    }

    private static isProviderBARelationOfProviderA(providerA: ProviderLocalData, providerB: ProviderLocalData): boolean {
        if (providerA.provider === providerB.provider) {
            for (const providerASequelId of providerA.sequelIds) {
                if (this.simpleProviderIdCheck(providerASequelId, providerB.id)) {
                    return true;
                }
            }
            for (const providerAPrequelId of providerA.prequelIds) {
                if (this.simpleProviderIdCheck(providerAPrequelId, providerB.id)) {
                    return true;
                }
            }
        }
        return false;
    }
}
