import ListProvider from '../../backend/api/provider/list-provider';
import { chOnce } from '../../backend/communication/channels';
import WorkerController from '../../backend/communication/ipc-renderer-controller';
import GetSyncStatusRecieved from '../../backend/controller/frontend/providers/sync-status/model/get-sync-status-recieved';
import GetSyncStatus from '../../backend/controller/frontend/providers/sync-status/model/get-sync-status';
import { chListener } from '../../backend/communication/listener-channels';
import FrontendSyncEpisodes from '../../backend/controller/frontend/providers/sync-status/model/sync-episodes';
export default class ProviderController {
    private static workerController: WorkerController = new WorkerController();

    public static async getAllAvaibleProviders(): Promise<ListProvider[]> {
        return await this.workerController.getOnce<ListProvider[]>(chOnce.GetAllListProviders);
    }

    public static async getAllProviderWithConnectedUser(): Promise<ListProvider[]> {
        return await this.workerController.getOnce<ListProvider[]>(chOnce.GetAllListProvidersWithConnectedUser);
    }

    public static async isProviderSync(data: GetSyncStatus): Promise<GetSyncStatusRecieved> {
        this.workerController.send(chOnce.GetSyncStatusOfProviderFromASeries, data);
        return await this.workerController.once<GetSyncStatusRecieved>(chOnce.GetSyncStatusOfProviderFromASeries + data.providerName);
    }

    public static syncAllEpisodes(providerName: string, seriesId: string): void {
        this.workerController.send(chListener.OnSyncEpisodeOfSeriesRequest, { providerName, seriesId } as FrontendSyncEpisodes);
    }
}