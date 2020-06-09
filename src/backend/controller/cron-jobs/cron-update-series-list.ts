import cron from 'node-cron';
import SyncSeries from '../sync-controller/sync-series';
export default class CronUpdateSeriesList {
    public static getUpdateSeriesListCronJob(): cron.ScheduledTask {
        const job = cron.schedule('*/30 * * * *', () => {
            SyncSeries.updateLocalSeriesListWithAllProviders();
        });
        return job;
    }

}