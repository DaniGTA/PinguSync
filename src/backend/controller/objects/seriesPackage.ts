import Series from './series';
import stringHelper from 'src/backend/helpFunctions/stringHelper';

/**
 * Contains all Relations of a Series.
 */
export default class SeriesPackage {
    id: string;
    allRelations: Series[] = [];
    constructor(...series: Series[]) {
        this.allRelations = series;
        this.id = stringHelper.randomString(25);
    }
}
