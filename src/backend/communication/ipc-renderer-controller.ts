import { ipcRenderer, IpcRenderer } from 'electron';

export default class WorkerController {
    public static getIpcRenderer(): IpcRenderer {
        return ipcRenderer;
    }

    public static send(channel: string, data?: any): void {
        console.log('info', 'frontend send: ' + channel);
        try {
            ipcRenderer.send(channel, data);
        } catch (err) {
            console.error(data);
            console.error(err);
            throw new Error(err);
        }
    }

    public static on(channel: string, f: (data: any) => void): void {
        ipcRenderer.on(channel, (event: Electron.IpcRendererEvent, data: any) => {
            console.log('info', 'frontend recieved data on: ' + channel);
            f(data);
        });
    }

    public static removeListener(channel: string, f: (data: any) => void): void {
        ipcRenderer.removeListener('channel', f);
    }

    /**
     * @param channel will be use for recieving data and send data.
     * @param sendData data that will be send with the send request.
     */
    public static async getOnce<T>(channel: string, sendData?: any): Promise<T> {
        const promise = this.once<T>(channel);
        this.send(channel, sendData);
        return await promise;
    }

    public static once<T>(channel: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {
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
    }
}
