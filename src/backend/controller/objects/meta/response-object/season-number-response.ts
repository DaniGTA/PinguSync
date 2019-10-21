import { AbsoluteResult } from '../../../../helpFunctions/comperators/comperator-results.ts/comperator-result';

export default class SeasonNumberResponse {
    public seasonNumber?: number;
    public absoluteResult: AbsoluteResult = AbsoluteResult.ABSOLUTE_NONE;
}
