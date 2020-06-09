import CronUpdateSeriesList from './cron-update-series-list';
import cron from 'node-cron';
export default class CronManager {

    private static loadedCronJobs = false;
    private static runningCronJobs: cron.ScheduledTask[] = [];

    public static init(): void {
        if (!this.loadedCronJobs) {
            this.runningCronJobs.push(CronUpdateSeriesList.getUpdateSeriesListCronJob());
            this.loadedCronJobs = true;
        }
    }
}