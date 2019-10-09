
export interface Links {
    self: string;
}

export interface Links2 {
    self: string;
    related: string;
}

export interface Genres {
    links: Links2;
}

export interface Links3 {
    self: string;
    related: string;
}

export interface Categories {
    links: Links3;
}

export interface Links4 {
    self: string;
    related: string;
}

export interface Castings {
    links: Links4;
}

export interface Links5 {
    self: string;
    related: string;
}

export interface Installments {
    links: Links5;
}

export interface Links6 {
    self: string;
    related: string;
}

export interface Mappings {
    links: Links6;
}

export interface Links7 {
    self: string;
    related: string;
}

export interface Reviews {
    links: Links7;
}

export interface Links8 {
    self: string;
    related: string;
}

export interface MediaRelationships {
    links: Links8;
}

export interface Links9 {
    self: string;
    related: string;
}

export interface Characters {
    links: Links9;
}

export interface Links10 {
    self: string;
    related: string;
}

export interface Staff {
    links: Links10;
}

export interface Links11 {
    self: string;
    related: string;
}

export interface Productions {
    links: Links11;
}

export interface Links12 {
    self: string;
    related: string;
}

export interface Quotes {
    links: Links12;
}

export interface Links13 {
    self: string;
    related: string;
}

export interface Episodes {
    links: Links13;
}

export interface Links14 {
    self: string;
    related: string;
}

export interface StreamingLinks {
    links: Links14;
}

export interface Links15 {
    self: string;
    related: string;
}

export interface AnimeProductions {
    links: Links15;
}

export interface Links16 {
    self: string;
    related: string;
}

export interface AnimeCharacters {
    links: Links16;
}

export interface Links17 {
    self: string;
    related: string;
}

export interface AnimeStaff {
    links: Links17;
}

export interface Relationships {
    genres: Genres;
    categories: Categories;
    castings: Castings;
    installments: Installments;
    mappings: Mappings;
    reviews: Reviews;
    mediaRelationships: MediaRelationships;
    characters: Characters;
    staff: Staff;
    productions: Productions;
    quotes: Quotes;
    episodes: Episodes;
    streamingLinks: StreamingLinks;
    animeProductions: AnimeProductions;
    animeCharacters: AnimeCharacters;
    animeStaff: AnimeStaff;
}

export interface Titles {
    en_jp: string;
    en_us: string;
    ja_jp: string;
    en: string;
}

export interface RatingFrequencies {
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    9: string;
    10: string;
    11: string;
    12: string;
    13: string;
    14: string;
    15: string;
    16: string;
    17: string;
    18: string;
    19: string;
    20: string;
}

export interface Tiny {
    width?: number;
    height?: number;
}

export interface Small {
    width?: number;
    height?: number;
}

export interface Medium {
    width?: number;
    height?: number;
}

export interface Large {
    width?: number;
    height?: number;
}

export interface Dimensions {
    tiny: Tiny;
    small: Small;
    medium: Medium;
    large: Large;
}

export interface Meta {
    dimensions: Dimensions;
}

export interface PosterImage {
    tiny: string;
    small: string;
    medium: string;
    large: string;
    original: string;
    meta: Meta;
}

export interface Tiny2 {
    width?: number;
    height?: number;
}

export interface Small2 {
    width?: number;
    height?: number;
}

export interface Large2 {
    width: number;
    height: number;
}

export interface Dimensions2 {
    tiny: Tiny2;
    small: Small2;
    large: Large2;
}

export interface Meta2 {
    dimensions: Dimensions2;
}

export interface CoverImage {
    tiny: string;
    small: string;
    large: string;
    original: string;
    meta: Meta2;
}

export interface Media {
    id: string;
    type: string;
    links: Links;
    relationships: Relationships;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
    synopsis: string;
    coverImageTopOffset: number;
    titles: Titles;
    canonicalTitle: string;
    abbreviatedTitles: string[];
    averageRating: string;
    ratingFrequencies: RatingFrequencies;
    userCount: number;
    favoritesCount: number;
    startDate: string;
    endDate: string;
    nextRelease?: any;
    popularityRank: number;
    ratingRank?: number;
    ageRating: string;
    ageRatingGuide: string;
    subtype: string;
    status: string;
    tba: string;
    posterImage: PosterImage;
    coverImage: CoverImage;
    episodeCount: number;
    episodeLength: number;
    totalLength: number;
    youtubeVideoId: string;
    showType: string;
    nsfw: boolean;
    episodes?: KitsuEpisode[];
    mappings?: KitsuMappings[];
}

export interface KitsuMappings {
    externalId: string;
    externalSite: string;
    id: string;
    type: string;
    updatedAt?: string;
    createdAt?: string;

}

export interface KitsuEpisode {
    airdate: string;
    cononicalTitle: string;
    createdAt: string;
    id: string;
    length: number;
    number: number;
    relativeNumber: number;
    seasonNumber: number;
    synopsis: string;
    thumbnail: KitsuEpisodeThumbnail[];
    titles: KitsuEpisodeTitle[];
    type: string;
    updatedAt: string;
}

export interface KitsuEpisodeTitle {
    en_jp?: string;
    en_us?: string;
    ja_jp?: string;
}

export interface KitsuEpisodeThumbnail {
    original: string;
}

export interface Meta3 {
    count: number;
}

export interface Links18 {
    first: string;
    next: string;
    last: string;
}

export interface SearchResult {
    data: Media[];
    meta: Meta3;
    links: Links18;
}

