export default interface ISeriesSearchResults {
    data?: ISeriesSearchResult[];
}

export interface ISeriesSearchResult {
    aliases?: string[];
    banner?: string;
    firstAired?: string;
    id?: string;
    network?: string;
    overview?: string;
    seriesName?: string;
    slug?: string;
    status?: string;
}
