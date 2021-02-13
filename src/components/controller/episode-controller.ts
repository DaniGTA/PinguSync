import ApiRequestController from './api-request-controller';
import { chOnce } from '../../backend/communication/channels';
import Episode from '../../backend/controller/objects/meta/episode/episode';
import WorkerController from '../../backend/communication/ipc-renderer-controller';
import { SingleEpisodeQuery } from '../../backend/controller/frontend/episodes/model/singel-episode-query';
import { chSend } from '../../backend/communication/send-only-channels';

export default class EpisodeController {
    public static async getEpisodeIdList(seriesId: string): Promise<string[][]> {
        return await ApiRequestController.getDataWithId(chOnce.GetEpisodeIdsListBySeriesId, seriesId);
    }

    public static async getSingleEpisode(episodeId: string, seriesId: string): Promise<Episode> {
        console.log('GetSingleEpisodeWithId: ' + episodeId + ' and ' + seriesId);
        const channel = chOnce.GetEpisodeByEpisodeId;
        WorkerController.send(channel, { episodeId, seriesId } as SingleEpisodeQuery);
        return new Promise<Episode>((resolve) => {
            WorkerController.getIpcRenderer().once(channel + '-' + episodeId, (event: Electron.IpcRendererEvent, data: Episode) => {
                resolve(data);
            });
        });
    }

    public static openEpisodeInExternalBrowser(episodeId: string, seriesId: string): void {
        WorkerController.send(chSend.OpenEpisodeInExternalBrowser, { episodeId, seriesId } as SingleEpisodeQuery);
    }
}