import WorkerController from '../../backend/communication/ipc-renderer-controller';

export default class ApiRequestController {
    public static workerController: WorkerController = new WorkerController();

    public static async getDataWithId<T>(channel: string, seriesId: string): Promise<T> {
        this.workerController.send(channel, seriesId);
        return new Promise<T>((resolve, reject) => {
            console.log('Listen: ' + channel + '-' + seriesId);
            this.workerController.getIpcRenderer().once(channel + '-' + seriesId, (event: Electron.IpcRendererEvent, data: T) => {
                console.log('RECIEVED: ' + channel + '-' + seriesId);
                resolve(data);
            });
        });
    }
}