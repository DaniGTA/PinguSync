import { IpcRenderer, shell } from 'electron';
import Worker from 'worker-loader!./providerController';
import { WorkerTransfer } from '../controller/objects/worker-transfer';
import logger from '../logger/logger';

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

    public send(channel: string, data?: any) {
        this.worker.postMessage(new WorkerTransfer(channel, data));
        logger.log('info', 'frontend send: ' + channel);
    }

    public async on(channel: string, f: (data: any) => void) {
        this.worker.addEventListener('message', (ev: MessageEvent) => {
            const transfer = ev.data as WorkerTransfer;

            if (transfer.channel === channel) {
               logger.log('info', 'frontend: ' + channel);
               if (typeof transfer.data !== 'undefined') {
                    try {
                        f(JSON.parse(transfer.data));
                    } catch (err) {
                        f(transfer.data);
                    }
                }
            }
        });
    }

    private processData(data: WorkerTransfer) {
        this.webcontent.send(data.channel, data.data);
    }
}
