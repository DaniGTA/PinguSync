export interface ISimklFullInfoMovieResponse {
    title: string;
    year: number;
    type: string;
    ids: IMovieIDS;
    rank: number;
    poster: string;
    fanart: string;
    released: Date;
    runtime: number;
    director: string;
    certification: string;
    budget: number;
    revenue: number;
    overview: string;
    genres: string[];
    country: string;
    ratings: IRatings;
    trailers: ITrailer[];
    release_dates: IReleaseDate[];
}

export interface IMovieIDS {
    simkl: number;
    slug: string;
    tmdb: string;
    imdb: string;
    offen: string;
}

export interface IRatings {
    simkl: IImdb;
    imdb: IImdb;
}

export interface IImdb {
    rating: number;
    votes: number;
}

export interface IReleaseDate {
    iso_3166_1: string;
    results: IResult[];
}

export interface IResult {
    type: number;
    release_date: Date;
}

export interface ITrailer {
    name: string;
    youtube: string;
    size: number;
}
