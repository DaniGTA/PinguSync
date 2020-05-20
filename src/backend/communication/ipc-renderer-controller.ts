import { ipcRenderer, IpcRenderer } from 'electron';

export default class WorkerController {
    constructor() {
        console.log('info', 'IPC RENDERER LOADED');
    }

    public getIpcRenderer(): IpcRenderer {
        return ipcRenderer;
    }

    public send(channel: string, data?: any): void {
        console.log('info', 'frontend send: ' + channel);
        ipcRenderer.send(channel, data);
    }

    public on(channel: string, f: (data: any) => void): void {
        ipcRenderer.on(channel, (event: Electron.IpcRendererEvent, data: any) => {
            console.log('info', 'frontend recieved data on: ' + channel);
            f(data);
        });
    }

    public removeListener(channel: string, f: (data: any) => void) {
        ipcRenderer.removeListener('channel', f);
    }

    /**
     * @param channel will be use for recieving data and send data.
     * @param sendData data that will be send with the send request.
     */
    public async getOnce<T>(channel: string, sendData?: any): Promise<T> {
        const promise = new Promise<T>((resolve, reject) => {
            try {
                console.log('info', 'frontend list once: ' + channel);
                ipcRenderer.once(channel, (event: Electron.IpcRendererEvent, data: T) => {
                    console.log('info', 'frontend recieved: ' + channel);
                    resolve(data as unknown as T);
                });
            } catch (err) {
                reject(err);
            }
        });
        this.send(channel, sendData);
        return await promise;
    }
}
