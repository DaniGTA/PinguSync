import { ipcRenderer } from 'electron';
import logger from '../logger/logger';


export default class WorkerController {
    constructor() {
        logger.log('info', 'IPC RENDERER LOADED');
    }
    public send(channel: string, data?: any): void {
        ipcRenderer.send(channel, data);
        logger.log('info', 'frontend send: ' + channel);
    }

    public on(channel: string, f: (data: any) => void): void {
        ipcRenderer.on(channel, (event: Electron.IpcRendererEvent, data: any) => {
            f(data);
        });
    }

    /**
     * @param channel will be use for recieving data and send data.
     * @param sendData data that will be send with the send request.
     */
    public async getOnce<T>(channel: string, sendData?: any): Promise<T> {
        this.send(channel, sendData);
        return new Promise<T>((resolve, reject) => {
            try {
                ipcRenderer.once(channel, (event: Electron.IpcRendererEvent, data: T) => {
                    logger.log('info', 'frontend recieved: ' + channel);
                    resolve(data as unknown as T);
                });
            } catch (err) {
                reject(err);
            }
        });
    }
}
