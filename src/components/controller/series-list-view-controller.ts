import { ListType } from '../../backend/controller/settings/models/provider/list-types';
import WorkerController from '../../backend/communication/ipc-renderer-controller';
import { chOnce } from '../../backend/communication/channels';
import { FailedCover } from '../../backend/controller/frontend/series/model/failed-cover';
import { chListener } from '../../backend/communication/listener-channels';

export default class SeriesListViewController {
    public static workerController: WorkerController = new WorkerController();

    public static selectedListType = ListType.ALL;

    public static async getSeriesIdsFromCurrentlySelectedListType(): Promise<string[]> {
        return await this.workerController.getOnce<string[]>(chOnce.GetSeriesIdsWithListType, this.selectedListType);
    }

    public static async getSeriesCoverUrlById(id: string): Promise<string | undefined> {
        return await this.getSeriesDataFromId(chOnce.GetPreferedCoverUrlBySeriesId, id);
    }

    public static async getSeriesNameById(id: string): Promise<string | undefined> {
        return await this.getSeriesDataFromId(chOnce.GetPreferedNameBySeriesId, id);
    }

    public static sendFailedCover(failedCover: FailedCover): void {
        this.workerController.send(chListener.OnSeriesFailedCoverImage, failedCover);
    }

    private static async getSeriesDataFromId<T>(channel: string, seriesId: string): Promise<T> {
        this.workerController.send(channel, seriesId);
        return new Promise<T>((resolve, reject) => {
            this.workerController.getIpcRenderer().once(channel + '-' + seriesId, (event: Electron.IpcRendererEvent, data: T) => {
                resolve(data);
            });
        });
    }
}
