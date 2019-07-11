import { IpcRenderer, ipcRenderer } from "electron";


export default class WorkerController {
    webcontent: IpcRenderer;
    constructor(webcontent: IpcRenderer) {
        console.log('IPC RENDERER LOADED');
        this.webcontent = webcontent;
    }
    public send(channel: string, data?: any) {
        ipcRenderer.send(channel, data);
        console.log("frontend send: " + channel);
    }

    public async on(channel: string, f: (data: any) => void) {
        ipcRenderer.on(channel, (event: Electron.IpcRendererEvent, data: any) => {
            f(data);
        })
    }
}
