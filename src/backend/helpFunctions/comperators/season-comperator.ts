import Season from '../../controller/objects/meta/season';
import Series from '../../controller/objects/series';
import { SeasonError } from '../../controller/objects/transfer/season-error';
import logger from '../../logger/logger';
import SeasonComperatorResult from './comperator-results.ts/season-comperator-result';

export default class SeasonComperator {
    public static async compareSeasons(a: Series, b: Series): Promise<SeasonComperatorResult> {
        const comperatorResult: SeasonComperatorResult = new SeasonComperatorResult();
        const aSeason = await a.getSeason();
        const bSeason = await b.getSeason();
        if (aSeason.seasonError === SeasonError.NONE || bSeason.seasonError === SeasonError.NONE) {
            comperatorResult.matchAble += 4;
            if (this.isSameSeason(aSeason, bSeason)) {
                comperatorResult.matches += 4;
                if (bSeason.seasonNumber !== 1 && aSeason.seasonNumber !== 1) {
                    try {
                        /** 
                        if (await this.hasOnlyProviderWithSameIdForSeasons(a) && !await this.hasOnlyProviderWithSameIdForSeasons(b)) {
                            comperatorResult.bFirstSeason = await b.getFirstSeason();
                        } else if (await this.hasOnlyProviderWithSameIdForSeasons(b) && !await this.hasOnlyProviderWithSameIdForSeasons(a)) {
                            comperatorResult.aFirstSeason = await a.getFirstSeason();
                        }
                        */
                    } catch (err) {
                        logger.error(err);
                    }
                }
            } else if (aSeason.seasonError === SeasonError.NONE && bSeason.seasonNumber === 1) {
                comperatorResult.matches += 1;
            } else if (bSeason.seasonError === SeasonError.NONE && aSeason.seasonNumber === 1) {
                comperatorResult.matches += 1;
            }
        }
        return comperatorResult;
    }
    /*
        public static async hasOnlyProviderWithSameIdForSeasons(series: Series): Promise<boolean> {
            for (const provider of series.getAllProviderLocalDatas()) {
                if (ProviderList.getExternalProviderInstance(provider).hasUniqueIdForSeasons) {
                    return false;
                }
            }
            return true;
        }*/
    /**
     * If the provider has no season number the series number will be take as fallback.
     * @param providerASeasonNumber Season number of the first provider.
     * @param providerBSeasonNumber Season number of the second provider.
     * @param seriesSeasonNumber Season number of the series.
     */
    public static isSameSeasonNumber(providerASeasonNumber?: number, providerBSeasonNumber?: number, seriesSeasonNumber?: number): boolean {
        if (providerASeasonNumber === providerBSeasonNumber) {
            return true;
        } else if (providerASeasonNumber && providerBSeasonNumber) {
            return false;
        }

        if (seriesSeasonNumber) {
            if (providerASeasonNumber) {
                if (seriesSeasonNumber === providerASeasonNumber) {
                    return true;
                }
            } else if (providerBSeasonNumber) {
                if (seriesSeasonNumber === providerBSeasonNumber) {
                    return true;
                }
            }
        }

        return false;
    }

    public static isSameSeason(seasonA: Season | undefined, seasonB: Season | undefined): boolean {
        if (seasonA !== undefined && seasonB !== undefined) {
            return seasonA.seasonNumber === seasonB.seasonNumber && seasonA.seasonPart === seasonB.seasonPart;
        } else if (seasonA === undefined && seasonB === undefined) {
            return true;
        } else {
            return false;
        }
    }
}
