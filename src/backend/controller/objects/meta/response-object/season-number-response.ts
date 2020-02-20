import { AbsoluteResult } from '../../../../helpFunctions/comperators/comperator-results.ts/comperator-result';
import Season from '../season';

export default class SeasonNumberResponse {
    public seasonNumber?: number;
    public absoluteResult: AbsoluteResult = AbsoluteResult.ABSOLUTE_NONE;

    public convertToSeason(seasonPart?: number): Season {
        return new Season(this.seasonNumber, seasonPart);
    }
}
