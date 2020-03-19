export interface IDatabaseEntry {
    sources: string[];
    title: string;
    type: 'TV' | 'Movie' | 'OVA' | 'ONA' | 'Special';
    episodes: number;
    status: 'FINISHED' | 'CURRENTLY' | 'UPCOMING' | 'UNKNOWN';
    picture: string;
    thumbnail: string;
    synonyms: string[];
    relations: string[];
}

export interface IAnimeOfflineDatabase {
    data: IDatabaseEntry[];
}



