export interface TMDBOnlineAPISeasonDetails {
    _id: string
    air_date: Date
    episodes: TMDBEpisode[]
    name: string
    overview: string
    id: number
    poster_path: string
    season_number: number
}

export interface TMDBEpisode {
    air_date: Date
    episode_number: number
    crew: Crew[]
    guest_stars: Crew[]
    id: number
    name: string
    overview: string
    production_code: string
    season_number: number
    still_path: string
    vote_average: number
    vote_count: number
}

export interface Crew {
    department?: Department
    job?: Job
    credit_id: string
    adult: boolean
    gender: number
    id: number
    known_for_department: Department
    name: string
    original_name: string
    popularity: number
    profile_path: null | string
    order?: number
    character?: string
}

export enum Department {
    Acting = 'Acting',
    Camera = 'Camera',
    Creator = 'Creator',
    Directing = 'Directing',
    Editing = 'Editing',
    Production = 'Production',
    Writing = 'Writing',
}

export enum Job {
    Director = 'Director',
    DirectorOfPhotography = 'Director of Photography',
    Editor = 'Editor',
    Writer = 'Writer',
}
