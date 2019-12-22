export default interface ITraktShowSeasonInfo {
    number: number;
    ids: IDS;
    rating?: number;
    votes?: number;
    episode_count?: number;
    aired_episodes?: number;
    title?: string;
    overview?: null | string;
    first_aired?: Date;
    network?: string;
    episodes?: IEpisode[];
}

export interface IEpisode {
    season: number;
    number: number;
    title: string;
    ids: IDS;
}

export interface IDS {
    trakt: number;
    tvdb: number | null;
    imdb?: string;
    tmdb: number;
}
