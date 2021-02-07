
export interface Ids {
    trakt?: number | string;
    tvdb?: number;
    imdb?: string;
    tmdb?: number;
}

export interface Episodes {
    watched_at?: Date;
    ids: Ids;
}

export interface EpisodeHistoryUpdate {
    episodes: Episodes[];
}

