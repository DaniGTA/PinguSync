
export interface Avatar {
    large: string;
}

export interface Options {
    titleLanguage: string;
    displayAdultContent: boolean;
}

export interface MediaListOptions {
    scoreFormat: string;
}

export interface Viewer {
    id: number;
    name: string;
    avatar: Avatar;
    unreadNotificationCount: number;
    donatorTier: number;
    updatedAt: number;
    options: Options;
    mediaListOptions: MediaListOptions;
}
