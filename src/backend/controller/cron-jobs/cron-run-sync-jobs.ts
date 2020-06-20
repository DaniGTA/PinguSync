import cron from 'cron';
import SyncExternalEpisodes from '../sync-controller/sync-external-episodes';

export default class CronRunSyncJobs {
    public static runEpisodeSyncJobs(): cron.CronJob {
        const job = cron.job('*/3 * * * *', () => {
            SyncExternalEpisodes.cronJobProcessSyncing();
        }, undefined, undefined, undefined, undefined, true);

        return job;
    }
}