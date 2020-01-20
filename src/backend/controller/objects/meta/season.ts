import { SeasonError } from '../transfer/season-error';

export default class Season {
    public seasonNumber?: number;
    public seasonPart?: number;
    public seasonError: SeasonError;
    constructor(seasonNumber?: number, seasonPart?: number, seasonError: SeasonError = SeasonError.NONE) {
        this.seasonNumber = seasonNumber;
        this.seasonError = seasonError;
        this.seasonPart = seasonPart;
    }

    public isSeasonNumberPresent(): boolean {
        if (this.seasonNumber !== undefined) {
            return !isNaN(this.seasonNumber);
        }
        return false;
    }
}
