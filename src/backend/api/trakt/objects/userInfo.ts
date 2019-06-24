export interface Ids {
    slug: string;
}

export interface Avatar {
    full: string;
}

export interface Images {
    avatar: Avatar;
}

export interface User {
    username: string;
    private: boolean;
    name: string;
    vip: boolean;
    vip_ep: boolean;
    ids: Ids;
    joined_at: Date;
    location: string;
    about: string;
    gender: string;
    age: number;
    images: Images;
    vip_og: boolean;
    vip_years: number;
}

export interface Account {
    timezone: string;
    date_format: string;
    time_24hr: boolean;
    cover_image?: any;
    token?: any;
}

export interface Connections {
    facebook: boolean;
    twitter: boolean;
    google: boolean;
    tumblr: boolean;
    medium: boolean;
    slack: boolean;
}

export interface SharingText {
    watching: string;
    watched: string;
}

export interface TraktUserInfo {
    user: User;
    account: Account;
    connections: Connections;
    sharing_text: SharingText;
}
