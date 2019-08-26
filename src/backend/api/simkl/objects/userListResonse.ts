export interface UserListResponse {
    shows: Show2[];
    anime: Anime[];
    movies: Movie2[];
}

export interface Movie2 {
    last_watched_at: string;
    user_rating?: any;
    status: string;
    movie: Movie;
}

interface Movie {
    title: string;
    poster: string;
    year: number;
    ids: Ids3;
}

interface Ids3 {
    simkl: number;
    imdb: string;
    tmdb: string;
}

export interface Anime {
    last_watched_at: string;
    user_rating?: number;
    status: string;
    last_watched?: string;
    next_to_watch?: string;
    watched_episodes_count?: number;
    total_episodes_count?: number;
    not_aired_episodes_count?: number;
    show: Show3;
}

interface Show3 {
    title: string;
    poster?: string;
    year: number;
    ids: Ids2;
}

interface Ids2 {
    simkl: number;
    imdb?: string;
    mal: string;
    anidb: string;
}

export interface Show2 {
    last_watched_at?: any;
    status: string;
    user_rating?: any;
    last_watched?: any;
    next_to_watch: string;
    watched_episodes_count: number;
    total_episodes_count: number;
    not_aired_episodes_count: number;
    show: Show;
}

interface Show {
    title: string;
    poster: string;
    year: number;
    ids: Ids;
}

interface Ids {
    simkl: number;
    slug: string;
    imdb: string;
    zap2it: string;
    tmdb: string;
    offen: string;
    tvdb: string;
}
