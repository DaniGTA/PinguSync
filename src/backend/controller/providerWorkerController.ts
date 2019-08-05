import ListProvider from '../api/ListProvider';
import ListController from './listController';
import Series from './objects/series';
import IUpdateList from './objects/iupdateList';
import ProviderList from './providerList';
import { WorkerTransfer } from './objects/workerTransfer';
import SeriesPackage from './objects/seriesPackage';

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
        for (const pl of ProviderList.listProviderList) {
            if (pl.hasOAuthCode) {
                this.on(pl.providerName.toLocaleLowerCase() + '-auth-code', async (code: string) => {
                    try {
                        await pl.logInUser(code);
                        that.send(pl.providerName.toLocaleLowerCase() + '-auth-status', await pl.isUserLoggedIn());
                    } catch (err) { }
                });
                this.on(pl.providerName.toLocaleLowerCase() + '-open-code-url', async (code: string) => {
                    that.send('open-url', pl.getTokenAuthUrl());
                });
            }
            this.on(pl.providerName.toLocaleLowerCase() + '-is-logged-in', async (code: string) => {
                try {
                    that.send(pl.providerName.toLocaleLowerCase() + '-auth-status', await pl.isUserLoggedIn());
                } catch (err) { }
            });
        }
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
                    this.send('all-providers', ProviderList.listProviderList.flatMap(x => x.providerName));
                    break;
            }
        });

    }

    private send(channel: string, data?: any) {
        let success = false;
        while (!success) {
            try {
                ctx.postMessage(new WorkerTransfer(channel, JSON.stringify(data)));
                console.log("worker send: " + channel);
                success = true;
            } catch (err) {
                ctx.postMessage(new WorkerTransfer(channel, ''));
                console.log(err);
            }
        }

    }

    static getProviderInstance(providerString: string): ListProvider {
        for (const provider of ProviderList.listProviderList) {
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

    public getPath(): string {
        return (process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + 'Library/Preferences' : process.env.HOME + "/.local/share")) + '/list-manager/'

    }

    public async updateClientList(targetIndex: number, updatedEntry: SeriesPackage) {
        console.log('[Send] -> update -> anime');
        this.send('update-series-list', { targetIndex, updatedEntry } as IUpdateList);
    }
    public async on(channel: string, f: (data: any) => void) {
        ctx.addEventListener('message', (ev: MessageEvent) => {
            const transfer = ev.data as WorkerTransfer;

            if (transfer.channel == channel) {
                console.log("worker: " + channel);
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
