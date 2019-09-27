import { MediaFormat } from './mediaFormat';
import { Relation } from './seriesList';

export interface Title {
    romaji: string;
    english: string;
    native: string;
    userPreferred: string;
}

export interface StartDate {
    year: number;
    month: number;
    day: number;
}

export interface EndDate {
    year: number;
    month: number;
    day: number;
}

export interface CoverImage {
    large: string;
    medium: string;
}

export interface Media {
    id: number;
    idMal: number;
    title: Title;
    startDate: StartDate;
    endDate: EndDate;
    coverImage: CoverImage;
    bannerImage: string;
    format: MediaFormat;
    type: string;
    status: string;
    episodes: number;
    chapters?: any;
    volumes?: any;
    season: string;
    description: string;
    averageScore: number;
    meanScore: number;
    genres: string[];
    synonyms: any[];
    nextAiringEpisode?: any;
    relations: Relation;
}

export interface GetSeriesByID {
    Media: Media;
}

