
export interface IAvatar {
    large: string;
}

export interface IOptions {
    titleLanguage: string;
    displayAdultContent: boolean;
}

export interface IMediaListOptions {
    scoreFormat: string;
}

export interface IViewer {
    id: number;
    name: string;
    avatar: IAvatar;
    unreadNotificationCount: number;
    donatorTier: number;
    updatedAt: number;
    options: IOptions;
    mediaListOptions: IMediaListOptions;
}
