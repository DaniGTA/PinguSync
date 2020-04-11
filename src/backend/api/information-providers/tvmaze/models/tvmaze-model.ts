export interface Search {
    score: number;
    show: Show;
}

export interface Show {
    id: number;
    url: string;
    name: string;
    type: Type;
    language: Language;
    genres: string[];
    status: Status;
    runtime: number | null;
    premiered: Date | null;
    officialSite: null | string;
    schedule: Schedule;
    rating: Rating;
    weight: number;
    network: Network | null;
    webChannel: Network | null;
    externals: Externals;
    image: Image | null;
    summary: null | string;
    updated: number;
    _links: FullInfoLinks;
    _embedded?: Embedded;
}

export interface Embedded {
    episodes: Episode[];
    akas: Aka[];
    seasons: Season[];
}

export interface Aka {
    name: string;
    country: Country | null;
}

export interface Country {
    name: string;
    code: string;
    timezone: string;
}

export interface Episode {
    id: number;
    url: string;
    name: string;
    season: number;
    number: number;
    airdate: Date;
    airtime: Airtime;
    airstamp: Date;
    runtime: number;
    image: Image | null;
    summary: null | string;
    _links: EpisodeLinks;
}

export interface EpisodeLinks {
    self: Nextepisode;
}

export interface Nextepisode {
    href: string;
}

export enum Airtime {
    The0135 = '01:35',
    The0940 = '09:40',
    The1100 = '11:00',
    The1200 = '12:00',
    The1300 = '13:00',
    The1330 = '13:30',
    The1930 = '19:30',
    The2000 = '20:00',
    The2100 = '21:00',
    The2130 = '21:30',
    The2200 = '22:00',
    The2215 = '22:15',
}

export interface Image {
    medium: string;
    original: string;
}

export interface Season {
    id: number;
    url: string;
    number: number;
    name: SeasonName;
    episodeOrder: number | null;
    premiereDate: Date | null;
    endDate: Date | null;
    network: Network;
    webChannel: Network | null;
    image: Image | null;
    summary: null | string;
    _links: EpisodeLinks;
}

/**
 * Name of the Season.
 */
export enum SeasonName {
    DGrayManHALLOW = 'D.Gray-man HALLOW',
    Empty = '',
}

export interface Network {
    id: number;
    name: string;
    country: Country | null;
}

export interface FullInfoLinks {
    self: Nextepisode;
    previousepisode?: Nextepisode;
    nextepisode?: Nextepisode;
}

export interface Externals {
    tvrage: number | null;
    thetvdb: number | null;
    imdb: null | string;
}

export enum Language {
    Chinese = 'Chinese',
    Dutch = 'Dutch',
    English = 'English',
    French = 'French',
    German = 'German',
    Italian = 'Italian',
    Japanese = 'Japanese',
    Korean = 'Korean',
    Spanish = 'Spanish',
    Swedish = 'Swedish',
}

export interface Rating {
    average: number | null;
}

export interface Schedule {
    time: string;
    days: Day[];
}

export enum Day {
    Friday = 'Friday',
    Monday = 'Monday',
    Saturday = 'Saturday',
    Sunday = 'Sunday',
    Thursday = 'Thursday',
    Tuesday = 'Tuesday',
    Wednesday = 'Wednesday',
}

export enum Status {
    Ended = 'Ended',
    InDevelopment = 'In Development',
    Running = 'Running',
    ToBeDetermined = 'To Be Determined',
}

export enum Type {
    Animation = 'Animation',
    Documentary = 'Documentary',
    GameShow = 'Game Show',
    PanelShow = 'Panel Show',
    Reality = 'Reality',
    Scripted = 'Scripted',
    Sports = 'Sports',
    Variety = 'Variety',
}
