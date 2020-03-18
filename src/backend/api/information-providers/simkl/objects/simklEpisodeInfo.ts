export interface ISimklEpisodeInfo {
    title: string;
    description: string | null;
    episode?: number;
    type: string;
    aired: boolean;
    img: string;
    date: string;
    ids: IDS;
}

export interface IDS {
    simkl_id: number;
}
