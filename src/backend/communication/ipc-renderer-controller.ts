import { IpcRenderer, ipcRenderer } from 'electron';
import logger from '../logger/logger';


export default class WorkerController {
    public webcontent: IpcRenderer;
    constructor(webcontent: IpcRenderer) {
       logger.log('info', 'IPC RENDERER LOADED');
       this.webcontent = webcontent;
    }
    public send(channel: string, data?: any) {
        ipcRenderer.send(channel, data);
        logger.log('info', 'frontend send: ' + channel);
    }

    public async on(channel: string, f: (data: any) => void) {
        ipcRenderer.on(channel, (event: Electron.IpcRendererEvent, data: any) => {
            f(data);
        });
    }
}
