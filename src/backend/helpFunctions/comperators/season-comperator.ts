import Season from '../../controller/objects/meta/season';
import Series from '../../controller/objects/series';
import { SeasonError } from '../../controller/objects/transfer/season-error';
import listHelper from '../list-helper';
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
            } else if (aSeason.isSeasonUndefined() && bSeason && bSeason.seasonNumbers.includes(1)) {
                comperatorResult.matches += 4;
            } else if (bSeason.isSeasonUndefined() && aSeason && aSeason.seasonNumbers.includes(1)) {
                comperatorResult.matches += 4;
            } else if (aSeason.seasonError === SeasonError.NONE && bSeason.seasonNumbers.includes(1) && aSeason.isSeasonUndefined()) {
                comperatorResult.matches += 1;
            } else if (bSeason.seasonError === SeasonError.NONE && aSeason.seasonNumbers.includes(1) && bSeason.isSeasonUndefined()) {
                comperatorResult.matches += 1;
            }
        }
        return comperatorResult;
    }

    public static isSameSeason(seasonA: Season | undefined, seasonB: Season | undefined): boolean {
        const seasonAStatus = seasonA ? seasonA.isSeasonUndefined() : true;
        const seasonBStatus = seasonB ? seasonB.isSeasonUndefined() : true;
        if (seasonA !== undefined && seasonB !== undefined) {
            return this.isSameSeasonNumber(seasonA, seasonB) && this.isSameSeasonPartNumber(seasonA, seasonB);
        } else if (seasonA === undefined && seasonB === undefined) {
            return true;
        } else if (seasonAStatus && seasonB?.seasonNumbers.includes(1)) {
            return true;
        } else if (seasonBStatus && seasonA?.seasonNumbers.includes(1)) {
            return true;
        }
        return false;
    }

    public static isSameSeasonNumber(seasonA?: Season, seasonB?: Season): boolean {
        const seasonAStatus = seasonA ? seasonA.isSeasonUndefined() : true;
        const seasonBStatus = seasonB ? seasonB.isSeasonUndefined() : true;
        if (seasonA !== undefined && seasonB !== undefined &&
            listHelper.isAnySeasonNumberListEntryInSeasonNumberList(seasonA?.seasonNumbers, seasonB?.seasonNumbers)) {
            return true;
        } else if (seasonBStatus && seasonAStatus) {
            return true;
        } else if (seasonAStatus && seasonB?.seasonNumbers.includes(1)) {
            return true;
        } else if (seasonBStatus && seasonA?.seasonNumbers.includes(1)) {
            return true;
        }
        return false;
    }

    public static isSameSeasonPartNumber(seasonA?: Season, seasonB?: Season): boolean {
        if (seasonA?.seasonPart === seasonB?.seasonPart) {
            return true;
        } else if (seasonA?.seasonPart === undefined && seasonB?.seasonPart === 1) {
            return true;
        } else if (seasonB?.seasonPart === undefined && seasonA?.seasonPart === 1) {
            return true;
        }
        return false;
    }
}
