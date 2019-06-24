
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

