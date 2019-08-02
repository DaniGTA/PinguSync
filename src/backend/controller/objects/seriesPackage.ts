import Series from './series';
import stringHelper from '../../../backend/helpFunctions/stringHelper';

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

    getAnyCoverUrl(): string {
        for (let relation of this.allRelations) {
            relation = Object.assign(new Series(),relation);
            const result = relation.getCoverImage();
           if(result){
               return result.url;
           }
        }
        return "";
    }
}
