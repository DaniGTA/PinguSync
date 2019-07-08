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

    constructor() {
        const that = this;
        if (typeof ProviderController.instance === 'undefined') {
            this.initController()
        }
        ProviderController.instance = that;
        for (const pl of ProviderList.list) {
            if (pl.hasOAuthCode) {
                ctx.addEventListener('message', async (ev: MessageEvent) => {
                    const value = ev.data as WorkerTransfer;
                    if (value.channel == value.data.provider.providerName.toLocaleLowerCase() + '-auth-status') {
                        const provider = await this.getProviderInstance(value.data.provider);
                        await provider.logInUser(value.data.code);
                        this.send(provider.providerName.toLocaleLowerCase() + '-auth-status', await provider.isUserLoggedIn());
                    }
                });
            }

        }
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
                case 'auth-status':
                    const provider = await this.getProviderInstance(value.data.provider);
                    await provider.logInUser(value.data.code);
                    this.send(provider.providerName.toLocaleLowerCase() + '-auth-status', await provider.isUserLoggedIn());
                    break;
                case 'is-logged-in':
                    const channel = (value.data + '' + '-is-logged-in').toLowerCase();
                    const data = await this.getProviderInstance(value.data).isUserLoggedIn();
                    this.send(channel, data);
                    break;
            }
        });

    }

    private send(channel: string, data: any) {

        ctx.postMessage(new WorkerTransfer(channel, data));

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

    public async updateClientList(targetIndex: number, updatedEntry: Anime) {
        console.log('[Send] -> update -> anime');
        this.send('update-series-list', { targetIndex, updatedEntry } as IUpdateList);
    }
}
new ProviderController();

export default ProviderController;
