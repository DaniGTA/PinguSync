import Series from "../controller/objects/series";
import { MediaType } from '../controller/objects/meta/media-type';

/**
 * A name provider gives only a list of names.
 * That can be used to find other variants of the name.
 */
export default interface InfoProvider {
    providerName: string;
    isOffline: boolean;
    hasUniqueIdForSeasons: boolean;
    supportedMediaTypes: MediaType[];

    getMoreSeriesInfoByName(series: Series, searchTitle: string): Promise<Series>;

}
