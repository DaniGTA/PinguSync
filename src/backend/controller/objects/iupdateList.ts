import Series from './series';
import SeriesPackage from './seriesPackage';

export default interface IUpdateList {
    targetIndex: number;
    updatedEntry: SeriesPackage;
}
