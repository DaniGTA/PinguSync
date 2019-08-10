export default interface SeriesSearchResults {
    data?: SeriesSearchResult[];
}

export interface SeriesSearchResult {
    aliases?: string[],
    banner?: string,
    firstAired?: string,
    id?: string,
    network?: string,
    overview?: string,
    seriesName?: string,
    slug?: string,
    status?: string,
}