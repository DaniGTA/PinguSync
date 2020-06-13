    export interface Ids {
        slug: string;
    }

    export interface Movie {
        watched_at: Date;
        ids: Ids;
    }

    export interface Movies {
        movies: Movie[];
    }