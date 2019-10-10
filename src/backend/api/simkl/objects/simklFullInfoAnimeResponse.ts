export interface ISimklFullInfoAnimeResponse {
    title: string;
    year: number;
    type: string;
    ids: ISimklFullInfoIDS;
    en_title: string | null;
    rank: number;
    poster: string;
    fanart: string;
    first_aired: Date;
    airs: IAirs;
    runtime: number;
    certification: null;
    overview: string;
    genres: string[];
    country: string;
    total_episodes: number;
    status: string;
    network: string;
    anime_type: string;
    ratings: IRatings;
    trailers: ITrailer[];
    users_recommendations: IUsersRecommendation[];
}

export interface IAirs {
    day: string;
    time: string;
    timezone: string;
}

export interface ISimklFullInfoIDS {
    simkl: number;
    slug: string;
    anidb: string;
    ann: string;
    mal: string;
    anfo: string;
    wikien: string;
    allcin: string;
    imdb: string;
    offjp: string;
    crunchyroll: string;
}

export interface IRatings {
    simkl: IImdb;
    imdb: IImdb;
    mal: IMal;
}

export interface IImdb {
    rating: number;
    votes: number;
}

export interface IMal {
    rating: number;
    votes: number;
    rank: number;
}

export interface ITrailer {
    name: null;
    youtube: string;
    size: number;
}

export interface IUsersRecommendation {
    title: string;
    en_title: null | string;
    year: number;
    poster: string;
    anime_type: string;
    users_percent: UsersPercent;
    users_count?: number;
    ids: IUsersRecommendationIDS;
}

export interface IUsersRecommendationIDS {
    simkl: number;
    slug: string;
}

export type UsersPercent = number | string;
