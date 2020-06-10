import CronUpdateSeriesList from './cron-update-series-list';
import cron from 'cron';
export default class CronManager {

    private static loadedCronJobs = false;
    private static runningCronJobs: cron.CronJob[] = [];

    public static init(): void {
        if (!this.loadedCronJobs) {
            this.runningCronJobs.push(...this.loadAllCronJobs());
            this.loadedCronJobs = true;
            this.startAllCronJobs();
        }
    }

    public static loadAllCronJobs(): cron.CronJob[] {
        const cronJobs: cron.CronJob[] = [];

        cronJobs.push(CronUpdateSeriesList.getUpdateSeriesListCronJob());

        return cronJobs;
    }

    public static startAllCronJobs(): void {
        this.runningCronJobs.forEach((x) => x.start());
    }
}