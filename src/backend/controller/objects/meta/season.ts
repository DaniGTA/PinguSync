import { SeasonError } from '../transfer/season-error';

export default class Season {
    public seasonNumber?: number;
    public seasonError: SeasonError;
    constructor(seasonNumber?: number, seasonError: SeasonError = SeasonError.NONE) {
        this.seasonNumber = seasonNumber;
        this.seasonError = seasonError;
    }
}
