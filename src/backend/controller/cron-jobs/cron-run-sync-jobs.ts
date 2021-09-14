import cron from 'cron'
import SyncExternalEpisodes from '../sync-controller/sync-external-episodes'

export default class CronRunSyncJobs {
    private static isJobProcessSyncingRunning = false
    public static getEpisodeSyncJobs(): cron.CronJob {
        const job = cron.job(
            '*/3 * * * *',
            () => {
                void this.runEpisodeSyncJobs()
            },
            undefined,
            undefined,
            undefined,
            undefined,
            true
        )

        return job
    }

    private static async runEpisodeSyncJobs(): Promise<void> {
        if (!this.isJobProcessSyncingRunning) {
            this.isJobProcessSyncingRunning = true
            try {
                await SyncExternalEpisodes.cronJobProcessSyncing()
            } finally {
                this.isJobProcessSyncingRunning = false
            }
        }
    }
}
