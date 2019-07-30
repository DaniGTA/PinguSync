export interface TVDBSeries {
    data: Data;
    errors: Errors;
}

interface Errors {
    invalidFilters: string[];
    invalidLanguage: string;
    invalidQueryParams: string[];
}

interface Data {
    added: string;
    airsDayOfWeek: string;
    airsTime: string;
    aliases: string[];
    banner: string;
    firstAired: string;
    genre: string[];
    id: number;
    imdbId: string;
    lastUpdated: number;
    network: string;
    networkId: string;
    overview: string;
    rating: string;
    runtime: string;
    seriesId: string;
    seriesName: string;
    siteRating: number;
    siteRatingCount: number;
    slug: string;
    status: string;
    zap2itId: string;
}
