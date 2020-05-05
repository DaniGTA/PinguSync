export interface GetUserSeriesListInfo {
    MediaListCollection: MediaListCollection;
}

export interface MediaListCollection {
    lists: List[];
}

export interface List {
    name: string;
    isCustomList: boolean;
    isSplitCompletedList: boolean;
    status: string;
}