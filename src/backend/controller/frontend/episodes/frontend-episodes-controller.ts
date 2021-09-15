import IPCBackgroundController from '../../../communication/ipc-background-controller'
import { chOnce } from '../../../communication/channels'
import MainListSearcher from '../../main-list-manager/main-list-searcher'
import Episode from '../../objects/meta/episode/episode'
import { SingleEpisodeQuery } from '../../frontend/episodes/model/singel-episode-query'
import SyncEpisodes from '../../sync-controller/sync-episodes'
import Series from '../../objects/series'
import logger from '../../../logger/logger'
import { chSend } from '../../../communication/send-only-channels'
import ProviderList from '../../provider-controller/provider-manager/provider-list'
import { shell } from 'electron'
import SyncExternalEpisodes from '../../sync-controller/sync-external-episodes'
import WatchHistory from '../../objects/meta/episode/episode-watch-history'

export default class FrontendEpisodesController {
    private com: IPCBackgroundController

    constructor() {
        this.com = new IPCBackgroundController()
        this.init()
    }

    private init(): void {
        //          Recieve Channel                     Recieved Data                  Response
        IPCBackgroundController.on<string>(chOnce.GetEpisodeIdsListBySeriesId, async (id, token) =>
            this.sendSeriesData(chOnce.GetEpisodeIdsListBySeriesId, id, await this.getEpisodeIdsList(id), token)
        )
        IPCBackgroundController.on(chOnce.GetEpisodeByEpisodeId, async (query: SingleEpisodeQuery, token) =>
            this.sendSeriesData(
                chOnce.GetEpisodeByEpisodeId,
                query.episodeId,
                await this.getSingleEpisode(query),
                token
            )
        )
        IPCBackgroundController.on(chOnce.IsEpisodeSync, async (query: SingleEpisodeQuery, token) =>
            this.sendSeriesData(chOnce.IsEpisodeSync, query.episodeId, await this.isEpisodeSync(query), token)
        )
        IPCBackgroundController.on(chOnce.WatchedEpisode, async (query: SingleEpisodeQuery, token) =>
            this.sendSeriesData(
                chOnce.WatchedEpisode,
                query.episodeId,
                await this.hasEpisodeAnyWatchedStatus(query),
                token
            )
        )

        IPCBackgroundController.on(chSend.OpenEpisodeInExternalBrowser, (query: SingleEpisodeQuery) =>
            this.openEpisodeInExternalBrowser(query)
        )
        IPCBackgroundController.on(chSend.MarkEpisodeAsWatched, (query: SingleEpisodeQuery) =>
            this.markEpisodeAsWatched(query)
        )
        IPCBackgroundController.on(chSend.MarkEpisodeAsUnwatched, (query: SingleEpisodeQuery) =>
            this.markEpisodeAsUnwatched(query)
        )
    }

    private async markEpisodeAsWatched(query: SingleEpisodeQuery): Promise<void> {
        const series = await MainListSearcher.findSeriesById(query.seriesId)
        const episode = await this.getSingleEpisode(query, series)
        if (episode) {
            episode?.watchHistory.push(new WatchHistory(new Date().getTime()))
            if (episode?.provider && series) {
                SyncExternalEpisodes.addSyncJob(episode?.provider, series)
            }
        }
    }

    private async markEpisodeAsUnwatched(query: SingleEpisodeQuery): Promise<void> {
        const episode = await this.getSingleEpisode(query)
        if (episode) {
            const watchHistory = new WatchHistory(new Date().getTime())
            watchHistory.watched = false
            episode.watchHistory.push(watchHistory)
        }
    }

    private async openEpisodeInExternalBrowser(query: SingleEpisodeQuery): Promise<void> {
        const series = await MainListSearcher.findSeriesById(query.seriesId)
        const episode = await this.getSingleEpisode(query, series)
        const provider = series?.getAllProviderLocalDatas().find(x => x.provider === episode?.provider)
        if (provider && episode) {
            const instance = ProviderList.getProviderInstanceByLocalData(provider)
            const url = await instance.getUrlToSingleEpisode(provider, episode)
            if (url) shell.openExternal(url)
        }
    }

    private async hasEpisodeAnyWatchedStatus(query: SingleEpisodeQuery): Promise<boolean> {
        return false
    }

    private async isEpisodeSync(query: SingleEpisodeQuery): Promise<boolean> {
        const series = await MainListSearcher.findSeriesById(query.seriesId)
        if (series) {
            const episode = await this.getSingleEpisode(query, series)
            if (episode) {
                return new SyncEpisodes(series).isSyncByEpisode(episode)
            } else {
                logger.error(
                    'Episode not found for: (episodeId: ' + query.episodeId + ') (seriesId: ' + query.seriesId + ')'
                )
            }
        } else {
            logger.error(
                'Series not found for: (episodeId: ' + query.episodeId + ') (seriesId: ' + query.seriesId + ')'
            )
        }
        return false
    }

    private async getEpisodeIdsList(id: string): Promise<string[][]> {
        const series = await MainListSearcher.findSeriesById(id)
        const episodesIds: string[][] = []
        if (series) {
            for (const episode of series.episodeBindingPools) {
                episodesIds.push(episode.bindedEpisodeMappings.map(x => x.id))
            }
        }

        return episodesIds
    }

    private async getSingleEpisode(
        query: SingleEpisodeQuery,
        series: Series | null = null
    ): Promise<Episode | undefined> {
        series = series ?? (await MainListSearcher.findSeriesById(query.seriesId))
        for (const localData of series?.getAllProviderLocalDatas() ?? []) {
            for (const episode of localData.getAllDetailedEpisodes()) {
                if (query.episodeId == episode.id) {
                    return episode
                }
            }
        }
    }

    private sendSeriesData(channel: string, id: string, data: any, token?: string): void {
        IPCBackgroundController.send(channel + '-' + id, data, token)
    }
}
