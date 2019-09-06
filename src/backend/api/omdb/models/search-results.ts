export interface SearchResults {
    Search: Search[];
    totalResults: string;
    Response: string;
}

export interface Search {
    Title: string;
    Year: string;
    imdbID: string;
    Type: string;
    Poster: string;
}
