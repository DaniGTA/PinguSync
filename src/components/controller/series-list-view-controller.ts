import { ListType } from '../../backend/controller/settings/models/provider/list-types';
import WorkerController from '../../backend/communication/ipc-renderer-controller';
import { chOnce } from '../../backend/communication/channels';
import { FailedCover } from '../../backend/controller/frontend/series/model/failed-cover';
import { chListener } from '../../backend/communication/listener-channels';
import IdListWithListType from './model/id-list-with-list-type';

export default class SeriesListViewController {
    public static workerController: WorkerController = new WorkerController();

    public static listener: (v: ListType) => void = () => { return; };
    public static _selectedListType: ListType = ListType.ALL;
    static get selectedListType(): ListType {
        return this._selectedListType;
    }

    static set selectedListType(value) {
        this._selectedListType = value;
        this.listener(value);
    }

    public static async getSeriesIdsFromCurrentlySelectedListType(): Promise<IdListWithListType[]> {
        if (this._selectedListType == ListType.ALL) {
            const allListTypesWithoutAll = Object.keys(ListType).map(x => Number.parseInt(x) as ListType).filter(x => x !== ListType.ALL).reverse();
            return await this.getSeriesIdsFromListTypes(allListTypesWithoutAll);
        } else {
            return this.getSeriesIdsFromListTypes([this._selectedListType]);
        }
    }

    public static async getSeriesIdsFromListTypes(listTypes: ListType[]): Promise<IdListWithListType[]> {
        const idListsWN: IdListWithListType[] = [];
        for (const listType of listTypes) {
            const idList = await this.workerController.getOnce<string[]>(chOnce.GetSeriesIdsWithListType, listType);
            if (idList.length !== 0) {
                idListsWN.push({ ids: idList, listType: listType });
            }
        }
        return idListsWN;
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
