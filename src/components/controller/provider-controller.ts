import ListProvider from '../../backend/api/provider/list-provider';
import { chOnce } from '../../backend/communication/channels';
import WorkerController from '../../backend/communication/ipc-renderer-controller';
export default class ProviderController {
    private static workerController: WorkerController = new WorkerController();

    public static async getAllAvaibleProviders(): Promise<ListProvider[]> {
        return await this.workerController.getOnce<ListProvider[]>(chOnce.GetAllListProviders);
    }
}