export interface ISimklTextSearchResults {
    title: string;
    year: number;
    poster: string;
    url: string;
    rank: number | null;
    ids: IDS;
    ratings: IRatings;
}

export interface IDS {
    simkl_id: number;
    slug: string;
}

export interface IRatings {
    simkl: IImdb;
    imdb?: IImdb;
}

export interface IImdb {
    rating: number;
    votes: number;
}
