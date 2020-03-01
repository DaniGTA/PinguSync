import { MediaFormat } from './mediaFormat';

export interface StartedAt {
    year?: number;
    month?: number;
    day?: number;
}

export interface CompletedAt {
    year?: number;
    month?: number;
    day?: number;
}

export interface Title {
    romaji: string;
    english: string;
    native: string;
    userPreferred: string;
}

export interface StartDate {
    year?: number;
    month?: number;
    day?: number;
}

export interface EndDate {
    year?: number;
    month?: number;
    day?: number;
}

export interface CoverImage {
    large: string;
    medium: string;
}

export interface Media {
    id: number;
    title: Title;
    type: string;
    status: string;
    episodes?: number;
    startDate: StartDate;
    endDate: EndDate;
    coverImage: CoverImage;
    bannerImage: string;
    relations: Relation;
    format: MediaFormat;
}

export interface Relation {
    edges: Edges[];
    nodes: Nodes[];
}
export interface Edges {
    relationType: MediaRelation;
}
export interface Nodes {
    id: number;
}

export interface Entry {
    id: number;
    score: number;
    scoreRaw: number;
    progress: number;
    progressVolumes?: any;
    repeat: number;
    private: boolean;
    priority: number;
    notes?: any;
    hiddenFromStatusLists: boolean;
    startedAt: StartedAt;
    completedAt: CompletedAt;
    updatedAt: number;
    createdAt: number;
    media: Media;

}

export interface List {
    name: string;
    isCustomList: boolean;
    isSplitCompletedList: boolean;
    entries: Entry[];
}

export interface Avatar {
    large: string;
}

export interface MediaListOptions {
    scoreFormat: string;
    rowOrder: string;
}

export interface User {
    id: number;
    name: string;
    avatar: Avatar;
    mediaListOptions: MediaListOptions;
}

export interface MediaListCollection {
    lists: List[];
    user: User;
}

export enum MediaRelation {
    // An adaption of the media into a different format
    ADAPTATION = 'ADAPTATION',
    // Released before the relation
    PREQUEL = 'PREQUEL',
    // Released after the relation
    SEQUEL = 'SEQUEL',
    // The media a side story is from
    PARENT = 'PARENT',
    // A side story of the parent media
    SIDE_STORY = 'SIDE_STORY',
    // Shares at least 1 character
    CHARACTER = 'CHARACTER',
    // A shortened and summarized version
    SUMMARY = 'SUMMARY',
    // An alternative version of the same media
    ALTERNATIVE = 'ALTERNATIVE',
    // An alternative version of the media with a different primary focus
    SPIN_OFF = 'SPIN_OFF',
    // Other
    OTHER = 'OTHER',
}
