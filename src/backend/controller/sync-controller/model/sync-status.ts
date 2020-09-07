import { SyncStatusType } from './sync-status-type';
import Episode from '../../objects/meta/episode/episode';

export class SyncStatus {
    public syncedEpisodeCount: number;
    public syncStatus = SyncStatusType.OUT_OF_SYNC;
    constructor(public isSync: boolean,
        lastSyncedEpisode: Episode | null,
        public maxEpisodeNumber: number) {
        if (isSync) {
            this.syncStatus = SyncStatusType.SYNC;
        }
        this.syncedEpisodeCount = lastSyncedEpisode?.getEpNrAsNr() ?? 0;
    }
}