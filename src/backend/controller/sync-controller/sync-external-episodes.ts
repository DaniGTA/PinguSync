import Series from '../objects/series';
import SyncEpisodes from './sync-episodes';
import ProviderList from '../provider-controller/provider-manager/provider-list';
import ListProvider from '../../api/provider/list-provider';
import { SyncJob } from './model/sync-episode-job';
import MainListSearcher from '../main-list-manager/main-list-searcher';
import logger from '../../logger/logger';
import listHelper from '../../helpFunctions/list-helper';

export default class SyncExternalEpisodes {
    private static plannedJobList: SyncJob[] = []
    public static addSyncJob(providerName: string, series: Series): void {
        if (this.canSync(providerName, series.id)) {
            this.plannedJobList.push({ providerName, seriesId: series.id });
        }
    }

    public static async cronJobProcessSyncing(): Promise<void> {
        const plannedJobs: SyncJob[] = [];
        for (const plannedJob of this.plannedJobList) {
            const isProviderAlreadyInList = plannedJobs.find(x => plannedJob.providerName === x.providerName);
            if (!isProviderAlreadyInList) {
                plannedJobs.push(plannedJob);
            }
        }
        const runningJobs: Array<Promise<void>> = [];
        for (const plannedJob of plannedJobs) {
            runningJobs.push(this.syncEpisodeOfSingleProvider(plannedJob));
        }
        await this.watchRunningJobs(runningJobs);
    }

    private static async watchRunningJobs(runningJobs: Array<Promise<void>>): Promise<void> {
        for (const runningJob of runningJobs) {
            try {
                await runningJob;
            } catch (err) {
                logger.error(err);
            }
        }
    }

    private static async syncEpisodeOfSingleProvider(job: SyncJob): Promise<void> {
        const providerInstance = ProviderList.getProviderInstanceByProviderName(job.providerName);
        const series = await MainListSearcher.findSeriesById(job.seriesId);
        if (providerInstance instanceof ListProvider && series) {
            const allEpisodesThatNeedSync = new SyncEpisodes(series).getAllEpisodeThatAreOutOfSync(providerInstance);
            console.info(`[Syncing] [${job.providerName}] [${job.seriesId}] Syncing ${allEpisodesThatNeedSync.length} episodes.`);
            await providerInstance.markEpisodeAsWatched(allEpisodesThatNeedSync);
        }
        listHelper.removeEntrys(this.plannedJobList, job);
    }

    private static canSync(provider: string, seriesId: string): boolean {
        return !this.plannedJobList.find(x => x.providerName === provider && x.seriesId === seriesId);
    }
}