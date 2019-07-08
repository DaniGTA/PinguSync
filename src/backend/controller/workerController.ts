import { shell, IpcRenderer } from "electron";
import ListProvider from '../api/ListProvider';
import Anime from './objects/anime';
import Worker from "worker-loader!./providerController";
import { WorkerTransfer } from './objects/workerTransfer';

export default class WorkerController {
    worker: Worker;
    webcontent: IpcRenderer;
    constructor(webcontent: IpcRenderer) {
        const that = this;
        this.webcontent = webcontent;
        this.worker = new Worker();


        this.worker.onmessage = ((ev: MessageEvent) => {
            const data = ev.data;
            that.processData(data);
        });
    }

    private processData(data: WorkerTransfer) {
        this.webcontent.send(data.channel, data.data);
    }

    public send(channel: string, data?: any) {
        this.worker.postMessage(new WorkerTransfer(channel, data));
    }

    public async on(channel: string, f: (data: any) => void) {
        this.worker.addEventListener('message', (ev: MessageEvent) => {
            const transfer = ev.data as WorkerTransfer;
            console.log(channel);
            if (transfer.channel == channel) {
                try {
                    f(JSON.parse(transfer.data));
                } catch (err) {
                    f(transfer.data);
                }
            }
        })
    }
}
