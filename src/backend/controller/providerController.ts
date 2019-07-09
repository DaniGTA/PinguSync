import ListProvider from '../api/ListProvider';
import ListController from './listController';
import Anime from './objects/anime';
import IUpdateList from './objects/iupdateList';
import ProviderList from './providerList';
import { WorkerTransfer } from './objects/workerTransfer';

const ctx: Worker = self as any;

class ProviderController {
    public static getInstance(): ProviderController {
        return ProviderController.instance;
    }

    private static instance: ProviderController;

    private path: string | null = null;

    constructor() {
        const that = this;
        if (typeof ProviderController.instance === 'undefined') {
            this.initController()
        }
        ProviderController.instance = that;
        for (const pl of ProviderList.list) {
            if (pl.hasOAuthCode) {
                this.on(pl.providerName.toLocaleLowerCase() + '-auth-status', async (code: string) => {
                    await pl.logInUser(code);
                    that.send(pl.providerName.toLocaleLowerCase() + '-auth-status', await pl.isUserLoggedIn());
                });
                this.on(pl.providerName.toLocaleLowerCase() + '-open-code-url', async (code: string) => {
                    that.send('open-url', pl.getTokenAuthUrl());
                });
            }
        }
        this.on('path', (path) => {
            that.path = path;
        })
        this.send('status');
    }

    public initController() {
        const that = this;

        ctx.addEventListener('message', async (ev: MessageEvent) => {
            const value = ev.data as WorkerTransfer;
            switch (value.channel) {
                case 'get-series-list':
                    that.sendSeriesList();
                    break;
                case 'request-info-refresh':
                    new ListController().forceRefreshProviderInfo(value.data);
                    break;
                case 'sync-series':
                    this.syncSeries(value.data);
                    break;
                /*case 'auth-status':
                    const provider = await this.getProviderInstance(value.data.provider);
                    await provider.logInUser(value.data.code);
                    this.send(provider.providerName.toLocaleLowerCase() + '-auth-status', await provider.isUserLoggedIn());
                    break;
                case 'is-logged-in':
                    const channel = (value.data + '' + '-is-logged-in').toLowerCase();
                    const data = await this.getProviderInstance(value.data).isUserLoggedIn();
                    this.send(channel, data);
                    break;*/
                case 'get-all-providers':
                    this.send('all-providers', ProviderList.list.flatMap(x => x.providerName));
                    break;
            }
        });

    }

    private send(channel: string, data?: any) {
        let success = false;
        while (!success) {
            try {
                ctx.postMessage(new WorkerTransfer(channel, JSON.stringify(data)));
                success = true;
            } catch (err) {
                console.log(err);
            }
        }

    }

    private getProviderInstance(providerString: string): ListProvider {
        for (const provider of ProviderList.list) {
            if (provider.providerName === providerString) {
                return provider;
            }
        }
        throw 'NoProviderFound';
    }

    private syncSeries(id: string | number) {
        var lc = new ListController();
        var anime = lc.getMainList().find(x => x.id === id);
        if (typeof anime != 'undefined') {
            lc.syncProvider(anime);
        } else {
            console.log('Error');
        }
    }

    public async sendSeriesList() {
        console.log('[Send] -> list -> anime');
        var list = new ListController().getMainList();
        this.send('series-list', list);
    }

    public async getPath(): Promise<string> {
        if (this.path == null) {
            return new Promise<string>((resolve, reject) => {
                this.on('path', (s) => {
                    this.path = s;
                    resolve(s);
                });
                this.send('get-path');
            })
        } else {
            return this.path;
        }
    }

    public async updateClientList(targetIndex: number, updatedEntry: Anime) {
        console.log('[Send] -> update -> anime');
        this.send('update-series-list', { targetIndex, updatedEntry } as IUpdateList);
    }
    public async on(channel: string, f: (data: any) => void) {
        ctx.addEventListener('message', (ev: MessageEvent) => {
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
new ProviderController();

export default ProviderController;
