import Series from "../controller/objects/series";

/**
 * A name provider gives only a list of names.
 * That can be used to find other variants of the name.
 */
export default interface InfoProvider {
    providerName: string;
    isOffline: boolean;
    getMoreSeriesInfoByName(series: Series, searchTitle: string): Promise<Series>;

}
