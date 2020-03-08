
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

export interface ICharacters {
    links: Links9;
}

export interface ILinks10 {
    self: string;
    related: string;
}

export interface IStaff {
    links: ILinks10;
}

export interface ILinks11 {
    self: string;
    related: string;
}

export interface IProductions {
    links: ILinks11;
}

export interface ILinks12 {
    self: string;
    related: string;
}

export interface IQuotes {
    links: ILinks12;
}

export interface ILinks13 {
    self: string;
    related: string;
}

export interface IEpisodes {
    links: ILinks13;
}

export interface ILinks14 {
    self: string;
    related: string;
}

export interface IStreamingLinks {
    links: ILinks14;
}

export interface ILinks15 {
    self: string;
    related: string;
}

export interface IAnimeProductions {
    links: ILinks15;
}

export interface ILinks16 {
    self: string;
    related: string;
}

export interface IAnimeCharacters {
    links: ILinks16;
}

export interface ILinks17 {
    self: string;
    related: string;
}

export interface IAnimeStaff {
    links: ILinks17;
}

export interface IRelationships {
    genres: Genres;
    categories: Categories;
    castings: Castings;
    installments: Installments;
    mappings: Mappings;
    reviews: Reviews;
    mediaRelationships: MediaRelationships;
    characters: ICharacters;
    staff: IStaff;
    productions: IProductions;
    quotes: IQuotes;
    episodes: IEpisodes;
    streamingLinks: IStreamingLinks;
    animeProductions: IAnimeProductions;
    animeCharacters: IAnimeCharacters;
    animeStaff: IAnimeStaff;
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

export interface IMeta2 {
    dimensions: Dimensions2;
}

export interface ICoverImage {
    tiny: string;
    small: string;
    large: string;
    original: string;
    meta: IMeta2;
}

export interface IMedia {
    id: string;
    type: string;
    links: Links;
    relationships: IRelationships;
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
    startDate?: string;
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
    coverImage: ICoverImage;
    episodeCount: number;
    episodeLength: number;
    totalLength: number;
    youtubeVideoId: string;
    showType: string;
    nsfw: boolean;
    episodes?: IKitsuEpisode[];
    mappings?: IKitsuMappings[];
}

export interface IKitsuMappings {
    externalId: string;
    externalSite: string;
    id: string;
    type: string;
    updatedAt?: string;
    createdAt?: string;

}

export interface IKitsuEpisode {
    airdate: string;
    cononicalTitle: string;
    createdAt: string;
    id: string;
    length: number;
    number: number;
    relativeNumber: number;
    seasonNumber: number;
    synopsis: string;
    thumbnail: IKitsuEpisodeThumbnail[];
    titles: IKitsuEpisodeTitle[] | IKitsuEpisodeTitle;
    type: string;
    updatedAt: string;
}

export interface IKitsuEpisodeTitle {
    en_jp?: string;
    en_us?: string;
    ja_jp?: string;
}

export interface IKitsuEpisodeThumbnail {
    original: string;
}

export interface IMeta3 {
    count: number;
}

export interface ILinks18 {
    first: string;
    next: string;
    last: string;
}

export interface ISearchResult {
    data: IMedia[];
    meta: IMeta3;
    links: ILinks18;
}

