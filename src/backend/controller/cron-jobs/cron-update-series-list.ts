import cron from 'cron';
import SyncSeries from '../sync-controller/sync-series';
export default class CronUpdateSeriesList {
    public static getUpdateSeriesListCronJob(): cron.CronJob {
        const job = cron.job('*/120 * * * *', () => {
            SyncSeries.updateLocalSeriesListWithAllProviders();
        }, undefined, undefined, undefined, undefined, true);

        return job;
    }

}