export interface Ids {
    trakt: number;
    slug: string;
    imdb: string;
    tmdb: number;
}

export interface Movie {
    title: string;
    year: number;
    ids: Ids;
}

export interface Ids2 {
    trakt: number;
    slug: string;
    tvdb: number;
    imdb: string;
    tmdb: number;
}

export interface Show {
    title: string;
    year: number;
    ids: Ids2;
}

export interface TraktSearch {
    type: string;
    score: number;
    movie: Movie;
    show: Show;
}
