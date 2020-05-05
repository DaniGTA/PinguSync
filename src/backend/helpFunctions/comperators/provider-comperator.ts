import MultiProviderResult from '../../api/provider/multi-provider-result';
import LocalDataBind from '../../controller/objects/extension/provider-extension/binding/local-data-bind';
import { MediaType } from '../../controller/objects/meta/media-type';
import Season from '../../controller/objects/meta/season';
import Series from '../../controller/objects/series';
import { SeasonError } from '../../controller/objects/transfer/season-error';
import { ProviderInfoStatus } from '../../controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status';
import ProviderLocalData from '../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import { ListProviderLocalData } from '../../controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../controller/provider-controller/provider-manager/provider-list';
import logger from '../../logger/logger';
import ProviderLocalDataWithSeasonInfo from '../provider/provider-info-downloader/provider-data-with-season-info';
import seasonHelper from '../season-helper/season-helper';
import ComperatorResult, { AbsoluteResult } from './comperator-results.ts/comperator-result';
import MediaTypeComperator from './media-type-comperator';
import SeasonComperator from './season-comperator';

export default class ProviderComperator {

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
            const [aMediaType, bMediaType] = await Promise.all([a.getMediaType(), b.getMediaType()]);
            if (aMediaType === bMediaType || aMediaType === MediaType.UNKOWN || bMediaType === MediaType.UNKOWN) {
                return this.simpleProviderSameIdAndSameSeasonCheckWithSeries(aProviders, bProviders, a, b);
            }

        } catch (err) {
            logger.error('Error at ProviderComperator.simpleProviderSameIdAndSameSeasonCheckOnSeries');
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
                        if (ProviderList.getProviderInstanceByLocalData(aProvider).hasUniqueIdForSeasons) {
                            return ProviderComperator.simpleProviderIdCheck(aProvider.id, bProvider.id);
                        } else {
                            const mediaTypeResult = MediaTypeComperator.comperaMediaType(aMediaType, bMediaType);
                            if (ProviderComperator.simpleProviderIdCheck(aProvider.id, bProvider.id) &&
                                mediaTypeResult.isAbsolute !== AbsoluteResult.ABSOLUTE_FALSE) {
                                if (aSeries && !aSeason) {
                                    aSeason = (await aSeries.getSeason());
                                }
                                if (bSeries && !bSeason) {
                                    bSeason = (await bSeries.getSeason());
                                }

                                if (aSeason && bSeason) {
                                    if (SeasonComperator.isSameSeason(aSeason, bSeason)) {
                                        if (aSeason.seasonError === SeasonError.NONE) {
                                            return true;
                                        } else if (aSeason.seasonError === bSeason.seasonError) {
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

    public static seriesHaveProviders(providers: MultiProviderResult, series: Series): boolean {
        for (const searchingProvider of providers.getAllProvidersWithSeason()) {
            for (const binding of series.getAllProviderBindings()) {
                if (this.isBindingAndProviderLocalDataWithSeasonTheSame(searchingProvider, binding)) {
                    return true;
                }
            }
        }
        return false;
    }

    public static isBindingAndProviderLocalDataWithSeasonTheSame(pws: ProviderLocalDataWithSeasonInfo, binding: LocalDataBind): boolean {
        if (this.simpleProviderIdCheck(pws.providerLocalData.id, binding.id)) {
            if (pws.providerLocalData.provider === binding.providerName) {
                if (pws.seasonTarget && binding.targetSeason) {
                    return SeasonComperator.isSameSeason(pws.seasonTarget, binding.targetSeason);
                } else {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * use this function to compare two provider ids.
     *
     * This function dosnt compare the type in the values.
     * @param id id1 will be compared with id2
     * @param id2 id2 will be compared with id1
     */
    public static simpleProviderIdCheck(id: string | number, id2: string | number): boolean {
        return id == id2;
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
            logger.error('Error at ProviderComperator.hasSameListProvider');
            logger.error(err);
        }
        return false;
    }

    private readonly aSeries: Series;
    private readonly bSeries: Series;
    private aSeriesSeason: Season | undefined;
    private bSeriesSeason: Season | undefined;
    constructor(aSeries: Series, bSeries: Series) {
        this.aSeries = aSeries;
        this.bSeries = bSeries;
    }

    public async getCompareResult(): Promise<ComperatorResult> {
        const comperatorResults: ComperatorResult[] = [];

        this.aSeriesSeason = await this.aSeries.getSeason();
        this.bSeriesSeason = await this.bSeries.getSeason();

        const allAProviderLocalDatas = this.aSeries.getAllProviderLocalDatas();
        const allBProviderLocalDatas = this.bSeries.getAllProviderLocalDatas();

        for (const provider of allAProviderLocalDatas) {
            try {
                const result = this.compareProviderAWithSameProvider(provider, ...allBProviderLocalDatas);
                comperatorResults.push(result);
                // tslint:disable-next-line: no-empty
            } catch (ignore) {
                logger.debug(ignore);
            }
        }

        return this.calculateResult(...comperatorResults);
    }

    private calculateResult(...results: ComperatorResult[]): ComperatorResult {
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

    private compareProviderAWithSameProvider(providerA: ProviderLocalData, ...providers: ProviderLocalData[]): ComperatorResult {
        const result = providers.find((x) => x.provider === providerA.provider);
        if (result) {
            return this.compareProviderAWithProviderB(providerA, result);
        }
        throw new Error('provider cant be compared (other series dont have provider: ' + providerA.provider + ')');
    }

    private compareProviderAWithProviderB(providerA: ProviderLocalData, providerB: ProviderLocalData): ComperatorResult {
        logger.debug(`[compareProviderAWithProviderB] Comparing season between provider: ${providerA.provider} (id:${providerA.id}) and ${providerB.provider} (id: ${providerB.id})`);
        const comperatorResult: ComperatorResult = new ComperatorResult();
        comperatorResult.matchAble += 2.5;
        if (ProviderComperator.simpleProviderIdCheck(providerA.id, providerB.id)) {
            providerA = Object.assign(new ListProviderLocalData(providerA.id), providerA);
            comperatorResult.matches += 2.5;
            const providerASeason = this.aSeries.getProviderSeasonTarget(providerA.provider);
            const providerBSeason = this.bSeries.getProviderSeasonTarget(providerB.provider);
            try {
                if (ProviderList.getProviderInstanceByLocalData(providerA).hasUniqueIdForSeasons) {
                    comperatorResult.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                    // tslint:disable-next-line: no-empty
                } else if (seasonHelper.isSeasonUndefined(providerASeason) && seasonHelper.isSeasonUndefined(providerBSeason)) {
                    if (!seasonHelper.isSeasonUndefined(this.aSeriesSeason) && SeasonComperator.isSameSeason(this.aSeriesSeason, this.bSeriesSeason)) {
                        comperatorResult.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                    } else if (!seasonHelper.isSeasonUndefined(this.aSeriesSeason) && !seasonHelper.isSeasonUndefined(this.bSeriesSeason)) {
                        comperatorResult.isAbsolute = AbsoluteResult.ABSOLUTE_FALSE;
                    } else {
                        comperatorResult.isAbsolute = AbsoluteResult.NOT_ABSOLUTE_TRUE;
                    }
                } else if (SeasonComperator.isSameSeason(providerASeason, providerBSeason)) {
                    comperatorResult.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                } else if (providerASeason?.isSeasonNumberPresent() || providerBSeason?.isSeasonNumberPresent()) {
                    comperatorResult.isAbsolute = AbsoluteResult.ABSOLUTE_FALSE;
                } else {
                    comperatorResult.matches -= 0.5;
                }
                // tslint:disable-next-line: no-empty
            } catch (err) {
                if (SeasonComperator.isSameSeason(providerASeason, providerBSeason)) {
                    comperatorResult.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                } else if (providerASeason?.isSeasonNumberPresent() && providerBSeason?.isSeasonNumberPresent()) {
                    comperatorResult.matches -= 0.5;
                }
                logger.debug('Error at ProviderComperator.compareProviderAWithProviderB');
                logger.debug(err);
            }
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

    private isProviderBARelationOfProviderA(providerA: ProviderLocalData, providerB: ProviderLocalData): boolean {
        if (providerA.provider === providerB.provider) {
            for (const providerASequelId of providerA.sequelIds) {
                if (ProviderComperator.simpleProviderIdCheck(providerASequelId, providerB.id)) {
                    return true;
                }
            }
            for (const providerAPrequelId of providerA.prequelIds) {
                if (ProviderComperator.simpleProviderIdCheck(providerAPrequelId, providerB.id)) {
                    return true;
                }
            }
        }
        return false;
    }
}
