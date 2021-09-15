import { SyncStatusType } from './../../../sync-controller/model/sync-status-type'
import ICommunication from '../../../../communication/icommunication'
import IPCBackgroundController from '../../../../communication/ipc-background-controller'
import { chOnce } from '../../../../communication/channels'
import GetSyncStatus from './model/get-sync-status'
import GetSyncStatusRecieved from './model/get-sync-status-recieved'
import MainListSearcher from '../../../main-list-manager/main-list-searcher'
import ProviderList from '../../../provider-controller/provider-manager/provider-list'
import ListProvider from '../../../../api/provider/list-provider'
import { chListener } from '../../../../communication/listener-channels'
import SyncExternalEpisodes from '../../../sync-controller/sync-external-episodes'
import FrontendSyncEpisodes from './model/sync-episodes'
import SyncEpisodes from '../../../sync-controller/sync-episodes'

export default class FrontendProviderSyncController {
    constructor() {
        this.init()
        // tslint:disable-next-line: no-unused-expression
    }

    private init(): void {
        IPCBackgroundController.on(chOnce.GetSyncStatusOfProviderFromASeries, async (x: GetSyncStatus, token) =>
            IPCBackgroundController.send(
                chOnce.GetSyncStatusOfProviderFromASeries + x.providerName,
                await this.getSyncStatusOfProviderFromASeries(x),
                token
            )
        )
        IPCBackgroundController.on(
            chListener.OnSyncEpisodeOfSeriesRequest,
            async (x: FrontendSyncEpisodes) => await this.syncEpisodeOfProvider(x)
        )
    }

    private async getSyncStatusOfProviderFromASeries(data: GetSyncStatus): Promise<GetSyncStatusRecieved> {
        const series = await MainListSearcher.findSeriesById(data.seriesId)
        const provider = ProviderList.getProviderInstanceByProviderName(data.providerName)
        if (series && provider instanceof ListProvider) {
            const se = new SyncEpisodes(series).getSyncStatus(provider)
            if (SyncExternalEpisodes.isSeriesOnWaitlist(data.seriesId, data.providerName)) {
                se.syncStatus = SyncStatusType.ON_SYNC_WAITLIST
            }
            return se as GetSyncStatusRecieved
        }
        return {} as GetSyncStatusRecieved
    }

    private async syncEpisodeOfProvider(x: FrontendSyncEpisodes): Promise<void> {
        const series = await MainListSearcher.findSeriesById(x.seriesId)
        if (series) {
            SyncExternalEpisodes.addSyncJob(x.providerName, series)
            await SyncExternalEpisodes.cronJobProcessSyncing()
        }
    }
}
