/* eslint-disable @typescript-eslint/no-floating-promises */
import FrontendSeriesListController from './list/frontend-series-list-controller'
import IPCBackgroundController from '../../../communication/ipc-background-controller'
import { chOnce } from '../../../communication/channels'
import MainListSearcher from '../../main-list-manager/main-list-searcher'
import FrontendSeriesInfos from '../../objects/transfer/frontend-series-infos'
import { chListener } from '../../../communication/listener-channels'
import { FailedCover } from './model/failed-cover'
import ProviderLocalData from '../../provider-controller/provider-manager/local-data/interfaces/provider-local-data'
import ProviderDataListManager from '../../provider-controller/provider-data-list-manager/provider-data-list-manager'
import isOnline from 'is-online'
import EpisodeMappingHelper from '../../../helpFunctions/episode-mapping-helper/episode-mapping-helper'
import MainListManager from '../../main-list-manager/main-list-manager'
import Overview from '../../objects/meta/overview'
import logger from '../../../logger/logger'
import ProviderList from '../../provider-controller/provider-manager/provider-list'
import PinguSyncMappingProvider from '../../../api/mapping-providers/pingu-sync-mapping-provider/pingu-sync-mapping-provider'

export default class FrontendSeriesController {
    public seriesListController: FrontendSeriesListController
    private com: IPCBackgroundController

    constructor() {
        this.com = new IPCBackgroundController()
        this.seriesListController = new FrontendSeriesListController()
        this.init()
    }

    private init(): void {
        IPCBackgroundController.on(chOnce.GetSeriesById, id =>
            this.sendSeriesData(chOnce.GetSeriesById, id, this.getSeriesById(id))
        )
        IPCBackgroundController.on(chOnce.GetPreferedCoverUrlBySeriesId, async id =>
            this.sendSeriesData(chOnce.GetPreferedCoverUrlBySeriesId, id, await this.getCoverUrlById(id))
        )
        IPCBackgroundController.on(chListener.OnSeriesFailedCoverImage, (failedCover: FailedCover) =>
            this.markCoverAsFailed(failedCover)
        )
        IPCBackgroundController.on(chOnce.GetPreferedNameBySeriesId, async id =>
            this.sendSeriesData(chOnce.GetPreferedNameBySeriesId, id, await this.getSeriesPreferedName(id))
        )
        IPCBackgroundController.on(chOnce.GetSeriesMaxEpisodeNumberBySeriesId, async id =>
            this.sendSeriesData(
                chOnce.GetSeriesMaxEpisodeNumberBySeriesId,
                id,
                await this.getSeriesMaxEpisodeNumberBy(id)
            )
        )
        IPCBackgroundController.on(chListener.OnSeriesEpisodeListRefreshRequest, id =>
            this.refreshSeriesEpisodeList(id)
        )
        IPCBackgroundController.on(chOnce.GetOverviewBySeriesId, async id => {
            this.sendSeriesData(chOnce.GetOverviewBySeriesId, id, await this.getSeriesOverviewBySeriesId(id))
        })
        IPCBackgroundController.on(chOnce.SaveSeriesInDB, async id => {
            await this.saveSeriesData(id)
        })
    }

    private async saveSeriesData(id: string): Promise<void> {
        const series = await MainListSearcher.findSeriesById(id)
        if (series) {
            const mapping = ProviderList.getProviderInstanceByClass(PinguSyncMappingProvider)
            const localData = await mapping.saveSeries(series)
            if (localData) {
                series.addMappingProvider(localData)
                MainListManager.updateSerieInList(series)
            }
        }
    }

    private async refreshSeriesEpisodeList(id: string): Promise<void> {
        const series = await MainListSearcher.findSeriesById(id)
        if (series) {
            series.episodeBindingPools = []
            const instance = await EpisodeMappingHelper.getEpisodeMappings(series)
            series.addEpisodeBindingPools(...instance)
            MainListManager.updateSerieInList(series)
        }
    }

    private async getSeriesById(id: string): Promise<FrontendSeriesInfos | null> {
        const result = await MainListSearcher.findSeriesById(id)
        if (result) {
            return new FrontendSeriesInfos(result)
        }
        return null
    }

    private async getCoverUrlById(id: string): Promise<string | undefined> {
        try {
            const result = await MainListSearcher.findSeriesById(id)
            const allCovers = result?.getAllCovers()
            const firstCover = allCovers?.find(x => !x.failed)
            return firstCover?.url
        } catch (err) {
            logger.error(err)
        }
        return
    }

    private async getSeriesMaxEpisodeNumberBy(id: string): Promise<number | undefined> {
        const result = await MainListSearcher.findSeriesById(id)
        return result?.episodeBindingPools?.length
    }

    private async getSeriesOverviewBySeriesId(id: string): Promise<Overview | undefined> {
        const result = await MainListSearcher.findSeriesById(id)
        const overviews = result?.getAllOverviews() ?? []
        return overviews[0]
    }

    private async getSeriesPreferedName(id: string): Promise<string | undefined> {
        const result = await MainListSearcher.findSeriesById(id)
        const names = result?.getAllNamesUnique() ?? []
        return names[0]?.name
    }

    private async markCoverAsFailed(failedCover: FailedCover): Promise<void> {
        const result = await MainListSearcher.findSeriesById(failedCover.seriesId)
        if (result) {
            if (await isOnline()) {
                const provider = this.findProviderWithCoverUrl(failedCover.coverUrl, result.getAllProviderLocalDatas())
                if (provider) {
                    const index = provider?.covers.findIndex(x => x.url === failedCover.coverUrl) ?? -1
                    if (index !== -1) {
                        provider.covers[index].failed = true
                        ProviderDataListManager.updateProviderInList(provider)
                    }
                }
            } else {
                logger.warn('Cant mark cover as failed - no internet connection')
            }
        }
    }

    private findProviderWithCoverUrl(coverUrl: string, providers: ProviderLocalData[]): ProviderLocalData | undefined {
        for (const provider of providers) {
            if (provider.covers.findIndex(x => x.url === coverUrl) !== -1) {
                return provider
            }
        }
    }

    private sendSeriesData(channel: string, id: string, data: any): void {
        IPCBackgroundController.send(channel + '-' + id, data)
    }
}
