import Episode from '../../objects/meta/episode/episode';

export class SyncStatus {
    public syncedEpisodeCount: number;
    constructor(public isSync: boolean,
        lastSyncedEpisode: Episode | null,
        public maxEpisodeNumber: number) {
        this.syncedEpisodeCount = lastSyncedEpisode?.getEpNrAsNr() ?? 0;
    }
}