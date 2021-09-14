import { chOnce } from '../../backend/communication/channels'
import WorkerController from '../../backend/communication/ipc-renderer-controller'
import GetSyncStatusRecieved from '../../backend/controller/frontend/providers/sync-status/model/get-sync-status-recieved'
import GetSyncStatus from '../../backend/controller/frontend/providers/sync-status/model/get-sync-status'
import { chListener } from '../../backend/communication/listener-channels'
import FrontendSyncEpisodes from '../../backend/controller/frontend/providers/sync-status/model/sync-episodes'
import { ListProviderInterface } from './model/list-provider-interface'

export default class ProviderController {
    public static async getAllAvaibleProviders(): Promise<ListProviderInterface[]> {
        return WorkerController.getOnce<ListProviderInterface[]>(chOnce.GetAllListProviders)
    }

    public static async getAllProviderWithConnectedUser(): Promise<ListProviderInterface[]> {
        return WorkerController.getOnce<ListProviderInterface[]>(chOnce.GetAllListProvidersWithConnectedUser)
    }

    public static async isProviderSync(data: GetSyncStatus): Promise<GetSyncStatusRecieved> {
        WorkerController.send(chOnce.GetSyncStatusOfProviderFromASeries, data)
        return WorkerController.once<GetSyncStatusRecieved>(
            chOnce.GetSyncStatusOfProviderFromASeries + data.providerName
        )
    }

    public static syncAllEpisodes(frontendSyncEpisodes: FrontendSyncEpisodes): void {
        WorkerController.send(chListener.OnSyncEpisodeOfSeriesRequest, frontendSyncEpisodes)
    }
}
