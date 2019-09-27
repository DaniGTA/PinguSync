export interface Ids {
    trakt: number;
    slug?: string;
    imdb?: string;
    tmdb?: number;
}

export interface Movie {
    collected_at?: Date;
    title?: string;
    year?: number;
    ids: Ids;
}

export interface Ids2 {
    trakt: number;
    slug?: string;
    tvdb?: number;
    imdb?: string;
    tmdb?: number;
}

export interface TraktEpisode {
    number: number;
}

export interface Season {
    number: number;
    episodes: TraktEpisode[];
}

export interface Show {
    title?: string;
    year?: number;
    ids: Ids2;
    seasons: Season[];
}

export interface Ids3 {
    trakt: number;
    tvdb: number;
    tmdb: number;
}

export interface Season2 {
    ids: Ids3;
}

export interface Ids4 {
    trakt: number;
    tvdb: number;
    imdb: string;
    tmdb: number;
}

export interface Episode2 {
    ids?: Ids4;
}

export class SendEntryUpdate {
    movies?: Movie[];
    shows: Show[];
    seasons?: Season2[];
    episodes?: Episode2[];
    constructor(movies: Movie[], shows: Show[], seasons: Season2[], episodes: Episode2[]) {
        this.movies = movies;
        this.shows = shows;
        this.seasons = seasons;
        this.episodes = episodes;
    }
}

