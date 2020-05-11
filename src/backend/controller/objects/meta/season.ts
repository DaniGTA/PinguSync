
import { SeasonError } from '../transfer/season-error';

export default class Season {
    /**
     * Some providers have season numbers like 1 or T1 or S1.
     * Thats why seasonNumber accepts a string and a number.
     * @type {(Array<(number | string)>)}
     * @memberof Season
     */
    public seasonNumbers: Array<(number | string)> = [];
    public seasonPart?: number;
    public seasonError: SeasonError;
    public confirmed = false;

    constructor(seasonNumbers?: (Array<(number | string)> | (number | string)), seasonPart?: number, seasonError: SeasonError = SeasonError.NONE) {
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
                if (!isNaN(seasonNumber as number)) {
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
    public getSingleSeasonNumberAsNumber(): number | undefined {
        if (this.seasonNumbers.length === 1 && !isNaN(this.seasonNumbers[0] as number)) {
            return this.seasonNumbers[0] as number;
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
