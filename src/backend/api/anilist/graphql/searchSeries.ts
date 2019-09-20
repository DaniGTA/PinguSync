import { MediaFormat } from './mediaFormat';
import { Relation } from './seriesList';

export interface Title {
    romaji: string;
    english: string;
    native: string;
}

export interface CoverImage {
    medium: string;
    large: string;
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

export interface Medium {
    id: number;
    title: Title;
    coverImage: CoverImage;
    bannerImage: string;
    format: MediaFormat;
    type: string;
    averageScore?: number;
    popularity: number;
    episodes: number;
    season: string;
    hashtag: string;
    isAdult: boolean;
    startDate: StartDate;
    endDate: EndDate;
    relations: Relation;
}

export interface Page {
    media: Medium[];
}

export interface SearchSeries {
    Page: Page;
}
