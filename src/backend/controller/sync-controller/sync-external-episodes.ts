import Series from '../objects/series'
import SyncEpisodes from './sync-episodes'
import ProviderList from '../provider-controller/provider-manager/provider-list'
import ListProvider from '../../api/provider/list-provider'
import { SyncJob } from './model/sync-episode-job'
import MainListSearcher from '../main-list-manager/main-list-searcher'
import logger from '../../logger/logger'
import listHelper from '../../helpFunctions/list-helper'
import { ProviderInfoStatus } from '../provider-controller/provider-manager/local-data/interfaces/provider-info-status'
import MainListAdder from '../main-list-manager/main-list-adder'

export default class SyncExternalEpisodes {
    private static plannedJobList: SyncJob[] = []
    public static addSyncJob(providerName: string, series: Series): void {
        if (this.canSync(providerName, series.id)) {
            this.plannedJobList.push({ providerName, seriesId: series.id })
        }
    }

    public static isSeriesOnWaitlist(seriesId: string, providerName: string): boolean {
        const result = this.plannedJobList.find(x => x.seriesId === seriesId && x.providerName === providerName)
        return !!result
    }

    public static async cronJobProcessSyncing(): Promise<void> {
        const plannedJobs: SyncJob[] = []
        for (const plannedJob of this.plannedJobList) {
            const isProviderAlreadyInList = plannedJobs.find(x => plannedJob.providerName === x.providerName)
            if (!isProviderAlreadyInList) {
                plannedJobs.push(plannedJob)
            }
        }
        const runningJobs: Array<Promise<void>> = []
        for (const plannedJob of plannedJobs) {
            runningJobs.push(this.syncEpisodeOfSingleProvider(plannedJob))
        }
        await this.watchRunningJobs(runningJobs)
    }

    private static async watchRunningJobs(runningJobs: Array<Promise<void>>): Promise<void> {
        for (const runningJob of runningJobs) {
            try {
                await runningJob
            } catch (err) {
                logger.error(err as string)
            }
        }
    }

    private static async syncEpisodeOfSingleProvider(job: SyncJob): Promise<void> {
        const providerInstance = ProviderList.getProviderInstanceByProviderName(job.providerName)
        let series = MainListSearcher.findSeriesById(job.seriesId)
        if (providerInstance instanceof ListProvider && series) {
            if (this.needSeriesUpdate(series, providerInstance)) {
                const updatedSeries = await this.getUpdatedSeries(series)
                if (updatedSeries) {
                    series = updatedSeries
                }
            }
            await this.syncProcess(series, providerInstance)
        }
        listHelper.removeEntrys(this.plannedJobList, job)
    }

    private static async syncProcess(series: Series, providerInstance: ListProvider): Promise<void> {
        const allEpisodesThatNeedSync = new SyncEpisodes(series).getAllEpisodeThatAreOutOfSync(providerInstance)
        logger.info(
            `[Syncing] [${providerInstance.providerName}] [${series.id}] Syncing ${allEpisodesThatNeedSync.length} episodes.`
        )
        if (allEpisodesThatNeedSync.length !== 0) {
            await providerInstance.markEpisodeAsWatched(allEpisodesThatNeedSync)
        }
    }

    private static needSeriesUpdate(series: Series, providerInstance: ListProvider): boolean {
        const providerLocalData = series.getOneProviderLocalDataByExternalProvider(providerInstance)
        return (
            ((providerLocalData?.infoStatus ??
                ProviderInfoStatus.NOT_AVAILABLE > ProviderInfoStatus.ADVANCED_BASIC_INFO) as boolean) &&
            providerLocalData?.version !== providerInstance.version
        )
    }

    private static async getUpdatedSeries(series: Series): Promise<Series | null> {
        await new MainListAdder().addSeriesWithoutCleanUp(series)
        return MainListSearcher.findSeriesById(series.id)
    }

    private static canSync(provider: string, seriesId: string): boolean {
        return !this.isSeriesOnWaitlist(seriesId, provider)
    }
}
