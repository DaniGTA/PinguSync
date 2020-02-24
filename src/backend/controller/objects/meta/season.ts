import { SeasonError } from '../transfer/season-error';

export default class Season {
    public seasonNumbers: number[] = [];
    public seasonPart?: number;
    public seasonError: SeasonError;
    constructor(seasonNumbers?: number[] | number, seasonPart?: number, seasonError: SeasonError = SeasonError.NONE) {
        if (seasonNumbers !== undefined) {
            // tslint:disable-next-line: prefer-conditional-expression
            if (Array.isArray(seasonNumbers)) {
                this.seasonNumbers = seasonNumbers;
            } else {
                this.seasonNumbers = [seasonNumbers as number];
            }
        }
        this.seasonError = seasonError;
        this.seasonPart = seasonPart;
    }

    public isSeasonNumberPresent(): boolean {
        if (this.seasonNumbers !== undefined) {
            for (const seasonNumber of this.seasonNumbers) {
                if (!isNaN(seasonNumber)) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Only returns a season number if the season object only have one season number.
     * if no or more then one season numbers are present it will return undefined.
     */
    public getSingleSeasonNumber(): number | undefined {
        if (this.seasonNumbers.length === 1) {
            return this.seasonNumbers[0];
        }
        return undefined;
    }

    public isSeasonUndefined(): boolean {
        if (this.seasonNumbers === undefined) {
            return true;
        } else if (this.seasonNumbers.length === 0) {
            return true;
        } else {
            return false;
        }
    }
}
