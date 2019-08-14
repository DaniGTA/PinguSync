
import Series from '../controller/objects/series';
/**
 * A name provider gives only a list of names.
 * That can be used to find other variants of the name.
 */
export default interface InfoProvider {
    providerName: string;
    getMoreSeriesInfoByName(anime: Series, searchTitle: string): Promise<Series>;
}
