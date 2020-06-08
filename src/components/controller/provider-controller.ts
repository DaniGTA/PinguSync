import ListProvider from '../../backend/api/provider/list-provider';
import { chOnce } from '../../backend/communication/channels';
import WorkerController from '../../backend/communication/ipc-renderer-controller';
import GetSyncStatusRecieved from '../../backend/controller/frontend/providers/sync-status/model/get-sync-status-recieved';
import GetSyncStatus from '../../backend/controller/frontend/providers/sync-status/model/get-sync-status';
export default class ProviderController {
    private static workerController: WorkerController = new WorkerController();

    public static async getAllAvaibleProviders(): Promise<ListProvider[]> {
        return await this.workerController.getOnce<ListProvider[]>(chOnce.GetAllListProviders);
    }

    public static async getAllProviderWithConnectedUser(): Promise<ListProvider[]> {
        return await this.workerController.getOnce<ListProvider[]>(chOnce.GetAllListProvidersWithConnectedUser);
    }

    public static async isProviderSync(data: GetSyncStatus) {
        return await this.workerController.getOnce<GetSyncStatusRecieved>(chOnce.GetSyncStatusOfProviderFromASeries, data);
    }
}