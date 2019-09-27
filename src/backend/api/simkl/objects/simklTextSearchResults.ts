export interface SimklTextSearchResults
{
    title:   string;
    year:    number;
    poster:  string;
    url:     string;
    rank:    number | null;
    ids:     IDS;
    ratings: Ratings;
}

export interface IDS {
    simkl_id: number;
    slug:     string;
}

export interface Ratings {
    simkl: Imdb;
    imdb?: Imdb;
}

export interface Imdb {
    rating: number;
    votes:  number;
}
