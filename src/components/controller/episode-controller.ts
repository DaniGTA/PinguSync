import ApiRequestController from './api-request-controller';
import { chOnce } from '../../backend/communication/channels';
import Episode from '../../backend/controller/objects/meta/episode/episode';
import WorkerController from '../../backend/communication/ipc-renderer-controller';

export default class EpisodeController {
    public static workerController: WorkerController = new WorkerController();

    public static async getEpisodeIdList(seriesId: string): Promise<string[][]> {
        return await ApiRequestController.getDataWithId(chOnce.GetEpisodeIdsListBySeriesId, seriesId);
    }

    public static async getSingleEpisode(episodeId: string, seriesId: string): Promise<Episode>{
        const channel = chOnce.GetEpisodeByEpisodeId;
        this.workerController.send(channel, {episodeId, seriesId} as SingleEpisodeQuery);
        return new Promise<Episode>((resolve, reject) => {
            this.workerController.getIpcRenderer().once(channel + '-' + episodeId, (event: Electron.IpcRendererEvent, data: Episode) => {
                resolve(data);
            });
        });
    }
}