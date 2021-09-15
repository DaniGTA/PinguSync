import cron from 'cron'
import SyncSeries from '../sync-controller/sync-series'
export default class CronUpdateSeriesList {
    static isCurrentlyUpdatingSeriesList = false
    public static getUpdateSeriesListCronJob(): cron.CronJob {
        return cron.job(
            '*/120 * * * *',
            () => {
                void this.runUpdateSeriesListCronJob()
            },
            undefined,
            undefined,
            undefined,
            undefined,
            true
        )
    }

    private static async runUpdateSeriesListCronJob(): Promise<void> {
        if (CronUpdateSeriesList.isCurrentlyUpdatingSeriesList === false) {
            CronUpdateSeriesList.isCurrentlyUpdatingSeriesList = true
            try {
                await SyncSeries.updateLocalSeriesListWithAllProviders()
            } finally {
                CronUpdateSeriesList.isCurrentlyUpdatingSeriesList = false
            }
        }
    }
}
