import Series from '../../../controller/objects/series';
import ComperatorResult from './comperator-result';

export default class SeasonComperatorResult extends ComperatorResult {
    public aFirstSeason: Series | null = null;
    public bFirstSeason: Series | null = null;
}
