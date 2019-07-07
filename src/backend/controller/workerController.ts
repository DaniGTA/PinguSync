import { ipcMain, shell } from "electron";
import ListProvider from '../api/ListProvider';
import ProviderList from './providerList';
import Anime from './objects/anime';
import Worker from "worker-loader!./providerController";

export default class WorkerController {
    worker: Worker;
    webcontent: Electron.WebContents;
    constructor(webcontent: Electron.WebContents) {
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

    private async initProvider(provider: ListProvider) {
        if (provider.hasOAuthCode) {
            ipcMain.on(provider.providerName.toLocaleLowerCase() + '-open-code', (event: any, code: string) => {
                shell.openExternal(provider.getTokenAuthUrl());
            });
            ipcMain.on(provider.providerName.toLocaleLowerCase() + '-auth-code', async (event: any, code: string) => {
                this.worker.postMessage(new WorkerTransfer('auth-status', { provider: provider.providerName, code }));
            });
        }
        ipcMain.on(provider.providerName.toLocaleLowerCase() + '-is-logged-in', async () => {
            this.worker.postMessage(new WorkerTransfer('is-logged-in', provider.providerName));
        });
    }

    public initController() {
        const that = this;
        for (const provider of ProviderList.list) {
            that.initProvider(provider);
        }

        ipcMain.on('get-all-providers', (event: any) => {
            const names: string[] = [];
            for (const provider of ProviderList.list) {
                names.push(provider.providerName);
            }
            console.log('Send all Providers');
            that.webcontent.send('all-providers', names);
        });

        ipcMain.on('get-series-list', async (event: any) => {
            this.worker.postMessage(new WorkerTransfer('get-series-list'));
        });

        ipcMain.on('request-info-refresh', async (event: any, anime: Anime) => {
            this.worker.postMessage(new WorkerTransfer('request-info-refresh', anime));
        });

        ipcMain.on('sync-series', async (event: any, id: string | number) => {
            this.worker.postMessage(new WorkerTransfer('sync-series', id));
        });
    }



}