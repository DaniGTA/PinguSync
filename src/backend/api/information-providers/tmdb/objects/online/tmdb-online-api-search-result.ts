export interface TMDBOnlineApiSearchResult {
    page: number
    results: TMDBOnlineApiSearchResultEntry[]
    total_results: number
    total_pages: number
}

export interface TMDBOnlineApiSearchResultEntry {
    poster_path?: null | string
    popularity: number
    id: number
    overview?: string
    backdrop_path?: null | string
    vote_average?: number
    media_type: TMDBOnlineApiSearchResultMediaType
    first_air_date?: string
    origin_country?: string[]
    genre_ids?: number[]
    original_language?: TMDBOnlineApiSearchResultOriginalLanguage
    vote_count?: number
    name?: string
    original_name?: string
    adult?: boolean
    release_date?: Date
    original_title?: string
    title?: string
    video?: boolean
    profile_path?: null | string
    known_for?: TMDBOnlineApiSearchResultEntry[]
}

export enum TMDBOnlineApiSearchResultMediaType {
    Movie = 'movie',
    Person = 'person',
    Tv = 'tv',
}

export enum TMDBOnlineApiSearchResultOriginalLanguage {
    En = 'en',
    It = 'it',
    Jp = 'jp',
    De = 'de',
}
