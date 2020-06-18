export interface Root {
    shows: Show[];
  }
  
  export interface Show {
    title: string;
    ids: Ids;
    seasons: Season[];
  }
  
  export interface Ids {
    trakt: number;
  }
  
  export interface Season {
    number: number;
    episodes: Episode[];
  }
  
  export interface Episode {
    number: number;
  }
  