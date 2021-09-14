import CronUpdateSeriesList from './cron-update-series-list'
import cron from 'cron'
import CronRunSyncJobs from './cron-run-sync-jobs'
export default class CronManager {
    private static loadedCronJobs = false
    private static runningCronJobs: cron.CronJob[] = []

    public static init(): void {
        if (!this.loadedCronJobs) {
            this.runningCronJobs.push(...this.loadAllCronJobs())
            this.loadedCronJobs = true
            this.startAllCronJobs()
        }
    }

    private static loadAllCronJobs(): cron.CronJob[] {
        const cronJobs: cron.CronJob[] = []

        cronJobs.push(CronUpdateSeriesList.getUpdateSeriesListCronJob())
        cronJobs.push(CronRunSyncJobs.getEpisodeSyncJobs())

        return cronJobs
    }

    public static startAllCronJobs(): void {
        this.runningCronJobs.forEach((x) => x.start())
    }
}
