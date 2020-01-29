import Season from '../../controller/objects/meta/season';
import Series from '../../controller/objects/series';
import { SeasonError } from '../../controller/objects/transfer/season-error';
import logger from '../../logger/logger';
import SeasonComperatorResult from './comperator-results.ts/season-comperator-result';

export default class SeasonComperator {
    public static async compareSeasons(a: Series, b: Series): Promise<SeasonComperatorResult> {
        const comperatorResult: SeasonComperatorResult = new SeasonComperatorResult();
        const seasonAPromise = a.getSeason();
        const seasonBPromise = b.getSeason();
        const aSeason = (await seasonAPromise);
        const bSeason = (await seasonBPromise);
        if (aSeason.seasonError === SeasonError.NONE || bSeason.seasonError === SeasonError.NONE) {
            comperatorResult.matchAble += 4;
            if (this.isSameSeason(aSeason, bSeason)) {
                comperatorResult.matches += 4;
            } else if (this.isSeasonUndefined(aSeason) && bSeason && bSeason.seasonNumber === 1) {
                comperatorResult.matches += 4;
            } else if (this.isSeasonUndefined(bSeason) && aSeason && aSeason.seasonNumber === 1) {
                comperatorResult.matches += 4;
            } else if (aSeason.seasonError === SeasonError.NONE && bSeason.seasonNumber === 1 && aSeason.seasonNumber === undefined) {
                comperatorResult.matches += 1;
            } else if (bSeason.seasonError === SeasonError.NONE && aSeason.seasonNumber === 1 && bSeason.seasonNumber === undefined) {
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

    public static isSameSeason(seasonA: Season | undefined, seasonB: Season | undefined): boolean {
        if (seasonA !== undefined && seasonB !== undefined) {
            return seasonA.seasonNumber === seasonB.seasonNumber && seasonA.seasonPart === seasonB.seasonPart;
        } else if (seasonA === undefined && seasonB === undefined) {
            return true;
        } else {
            return false;
        }
    }

    public static isSeasonUndefined(season: Season | undefined): boolean {
        if (season === undefined) {
            return true;
        } else if (season.seasonNumber === undefined) {
            return true;
        }
        return false;
    }
}
