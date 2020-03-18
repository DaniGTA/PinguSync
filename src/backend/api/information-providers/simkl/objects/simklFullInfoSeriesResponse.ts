export interface ISimklFullInfoSeriesResponse {
    title: string;
    year: number;
    type: string;
    ids: ISeriesIDS;
    rank: number;
    poster: string;
    fanart: string;
    first_aired: Date;
    airs: IAirs;
    runtime: number;
    certification: string;
    overview: string;
    genres: string[];
    country: string;
    total_episodes: number;
    status: string;
    network: string;
    ratings: IRatings;
    trailers: null;
}

export interface IAirs {
    day: string;
    time: string;
    timezone: string;
}

export interface ISeriesIDS {
    simkl: number;
    slug: string;
    tvdb: string;
    imdb: string;
    zap2it: string;
}

export interface IRatings {
    simkl: IImdb;
    imdb: IImdb;
}

export interface IImdb {
    rating: number;
    votes: number;
}
