export interface TraktShowSeasonInfo {
    number:   number;
    ids:      IDS;
    episodes: Episode[];
}

export interface Episode {
    season: number;
    number: number;
    title:  string;
    ids:    IDS;
}

export interface IDS {
    trakt: number;
    tvdb:  number | null;
    imdb?: string;
    tmdb:  number;
}
