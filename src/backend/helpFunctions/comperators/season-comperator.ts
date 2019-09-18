import Series from "../../controller/objects/series";
import SeasonComperatorResult from './comperator-results.ts/season-comperator-result';
import { AbsoluteResult } from './comperator-results.ts/comperator-result';
import ProviderList from '../../controller/provider-manager/provider-list';
import { SeasonError } from '../../controller/objects/transfer/season-error';

export default class SeasonComperator {
    static async compareSeasons(a: Series, b: Series): Promise<SeasonComperatorResult> {
        const comperatorResult: SeasonComperatorResult = new SeasonComperatorResult();
        const aSeason = await a.getSeason();
        const bSeason = await b.getSeason();
        if (aSeason.seasonError == SeasonError.NONE || bSeason.seasonError == SeasonError.NONE) {
            comperatorResult.matchAble += 3;
            if (aSeason.seasonNumber === bSeason.seasonNumber) {
                comperatorResult.matches += 3;
                if (bSeason.seasonNumber != 1 && aSeason.seasonNumber != 1) {
                    try {
                        if (await this.hasOnlyProviderWithSameIdForSeasons(a) && !await this.hasOnlyProviderWithSameIdForSeasons(b)) {
                            comperatorResult.bFirstSeason = await b.getFirstSeason();
                        } else if (await this.hasOnlyProviderWithSameIdForSeasons(b) && !await this.hasOnlyProviderWithSameIdForSeasons(a)) {
                            comperatorResult.aFirstSeason = await a.getFirstSeason();
                        }
                    } catch (err) { }
                    if (comperatorResult.aFirstSeason) {
                        for (const listProviderInfos of comperatorResult.aFirstSeason.getListProvidersInfos()) {
                            for (const lpi of b.getListProvidersInfos()) {
                                if (listProviderInfos.provider === lpi.provider && listProviderInfos.id === lpi.id && aSeason !== await comperatorResult.aFirstSeason.getSeason()) {
                                    comperatorResult.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                                    return comperatorResult;
                                }
                            }
                        }

                    } else if (comperatorResult.bFirstSeason) {
                        for (const listProviderInfos of comperatorResult.bFirstSeason.getListProvidersInfos()) {
                            for (const lpi of a.getListProvidersInfos()) {
                                if (listProviderInfos.provider === lpi.provider && listProviderInfos.id === lpi.id && aSeason !== await comperatorResult.bFirstSeason.getSeason()) {
                                    comperatorResult.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                                    return comperatorResult;
                                }
                            }
                        }
                    }
                }
            } else if (aSeason.seasonError == SeasonError.NONE && bSeason.seasonNumber === 1) {
                comperatorResult.matches += 1;
            } else if (bSeason.seasonError == SeasonError.NONE  && aSeason.seasonNumber === 1) {
                comperatorResult.matches += 1;
            }
        }
        return comperatorResult;
    }

    static async hasOnlyProviderWithSameIdForSeasons(series: Series): Promise<boolean> {
        for (const provider of series.getAllProviderLocalDatas()) {
            if (ProviderList.getExternalProviderInstance(provider).hasUniqueIdForSeasons) {
                return false;
            }
        }
        return true;
    }

}
