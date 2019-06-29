
export interface Ids {
    trakt: number;
    slug: string;
    tvdb: number;
    imdb: string;
    tmdb: number;
}

export interface Airs {
    day: string;
    time: string;
    timezone: string;
}

export interface FullShowInfo {
    title: string;
    year: number;
    ids: Ids;
    overview: string;
    first_aired: Date;
    airs: Airs;
    runtime: number;
    certification: string;
    network: string;
    country: string;
    updated_at: Date;
    trailer?: any;
    homepage: string;
    status: string;
    rating: number;
    votes: number;
    comment_count: number;
    language: string;
    available_translations: string[];
    genres: string[];
    aired_episodes: number;
}


