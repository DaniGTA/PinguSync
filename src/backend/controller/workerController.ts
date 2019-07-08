import { shell, IpcRenderer } from "electron";
import ListProvider from '../api/ListProvider';
import ProviderList from './providerList';
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

        this.initController();
    }

    private processData(data: WorkerTransfer) {
        this.webcontent.send(data.channel, data.data);
    }

    public send(channel: string, data?: any) {
        this.worker.postMessage(new WorkerTransfer(channel, data));
    }

    private async initProvider(provider: ListProvider) {
        if (provider.hasOAuthCode) {
            this.webcontent.on(provider.providerName.toLocaleLowerCase() + '-open-code', (event: any, code: string) => {
                shell.openExternal(provider.getTokenAuthUrl());
            });
            this.webcontent.on(provider.providerName.toLocaleLowerCase() + '-auth-code', async (event: any, code: string) => {
                this.worker.postMessage(new WorkerTransfer('auth-status', { provider: provider.providerName, code }));
            });
        }
        this.webcontent.on(provider.providerName.toLocaleLowerCase() + '-is-logged-in', async () => {
            this.worker.postMessage(new WorkerTransfer('is-logged-in', provider.providerName));
        });
    }

    private initController() {
        const that = this;
        for (const provider of ProviderList.list) {
            that.initProvider(provider);
        }

        this.webcontent.on('get-all-providers', (event: any) => {
            const names: string[] = [];
            for (const provider of ProviderList.list) {
                names.push(provider.providerName);
            }
            console.log('Send all Providers');
            that.webcontent.send('all-providers', names);
        });

        this.webcontent.on('get-series-list', async (event: any) => {
            this.worker.postMessage(new WorkerTransfer('get-series-list'));
        });

        this.webcontent.on('request-info-refresh', async (event: any, anime: Anime) => {
            this.worker.postMessage(new WorkerTransfer('request-info-refresh', anime));
        });

        this.webcontent.on('sync-series', async (event: any, id: string | number) => {
            this.worker.postMessage(new WorkerTransfer('sync-series', id));
        });
    }



}