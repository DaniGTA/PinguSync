import { ListType } from '../../backend/controller/settings/models/provider/list-types';
import WorkerController from '../../backend/communication/ipc-renderer-controller';
import { chOnce } from '../../backend/communication/channels';
import FrontendSeriesInfos from '../../backend/controller/objects/transfer/frontend-series-infos';

export default class SeriesListViewController {
    public static workerController: WorkerController = new WorkerController();

    public static selectedListType = ListType.ALL;

    public static async getSeriesIdsFromCurrentlySelectedListType(): Promise<string[]> {
        return await this.workerController.getOnce<string[]>(chOnce.GetSeriesIdsWithListType, this.selectedListType);
    }
    public static async getSeriesById(id: string): Promise<FrontendSeriesInfos> {
        this.workerController.send(chOnce.GetSeriesById, id);
        return new Promise<FrontendSeriesInfos>((resolve, reject) => {
            this.workerController.getIpcRenderer().once(chOnce.GetSeriesById + '-' + id, (event: Electron.IpcRendererEvent, data: FrontendSeriesInfos) => {
                resolve(data);
            });
        });
    }
}