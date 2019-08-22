import ComperatorResult from "./comperator-result";
import Series from '../../../controller/objects/series';

export default class SeasonComperatorResult extends ComperatorResult {
    aFirstSeason:Series | null = null;
    bFirstSeason:Series | null = null;
}