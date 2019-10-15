import ListProvider from '../api/provider/list-provider';
import logger from '../logger/logger';
import ListController from './list-controller';
import SeriesPackage from './objects/series-package';
import IUpdateList from './objects/update-list';
import { WorkerTransfer } from './objects/worker-transfer';
import ProviderList from './provider-manager/provider-list';

const ctx: Worker = self as any;

class ProviderController {
    public static getInstance(): ProviderController {
        return ProviderController.instance;
    }

    public static getProviderInstance(providerString: string): ListProvider {
        for (const provider of ProviderList.getListProviderList()) {
            if (provider.providerName === providerString) {
                return provider;
            }
        }
        throw new Error('NoProviderFound');
    }

    private static instance: ProviderController;

    private path: string | null = null;

    constructor() {
        const that = this;

        if (typeof ProviderController.instance === 'undefined') {
            this.initController();
        }
        ProviderController.instance = that;
        for (const pl of ProviderList.getListProviderList()) {
            if (pl.hasOAuthCode) {
                this.on(pl.providerName.toLocaleLowerCase() + '-auth-code', async (code: string) => {
                    try {
                        await pl.logInUser(code);
                        that.send(pl.providerName.toLocaleLowerCase() + '-auth-status', await pl.isUserLoggedIn());
                    } catch (err) {
                        logger.error(err);
                    }
                });
                this.on(pl.providerName.toLocaleLowerCase() + '-open-code-url', async (code: string) => {
                    that.send('open-url', pl.getTokenAuthUrl());
                });
            }
            this.on(pl.providerName.toLocaleLowerCase() + '-is-logged-in', async (code: string) => {
                try {
                    that.send(pl.providerName.toLocaleLowerCase() + '-auth-status', await pl.isUserLoggedIn());
                } catch (err) {
                    logger.error(err);
                }
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
                    if (ListController.instance) {
                        ListController.instance.forceRefreshProviderInfo(value.data);
                    } else {
                        logger.log('info', 'Failed request info refresh: no list controller instance');
                    }
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
                    this.send('all-providers', ProviderList.getListProviderList().flatMap((x) => x.providerName));
                    break;
            }
        });

    }

    public async sendSeriesList() {
        logger.log('info', '[Send] -> list -> anime');
        if (ListController.instance) {
            const list = ListController.instance.getMainList();
            this.send('series-list', list);
        } else {
            logger.error('Failed send list: no list controller instance');
        }
    }

    public getPath(): string {
        return (process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + 'Library/Preferences' : process.env.HOME + '/.local/share')) + '/list-manager/';

    }

    public async updateClientList(targetIndex: number, updatedEntry: SeriesPackage) {
        logger.log('info', '[Send] -> update -> anime');
        this.send('update-series-list', { targetIndex, updatedEntry } as IUpdateList);
    }
    public async on(channel: string, f: (data: any) => void) {
        ctx.addEventListener('message', (ev: MessageEvent) => {
            const transfer = ev.data as WorkerTransfer;

            if (transfer.channel === channel) {
                logger.log('info', 'worker: ' + channel);
                try {
                    f(JSON.parse(transfer.data));
                } catch (err) {
                    f(transfer.data);
                }
            }
        });
    }


    private async syncSeries(id: string | number) {
        if (ListController.instance) {
            const lc = ListController.instance;
            const anime = (await lc.getMainList()).find((x) => x.id === id);
            if (typeof anime !== 'undefined') {
                lc.syncProvider(anime);
            } else {
                logger.error('Error');
            }
        } else {
            logger.error('Failed sync series: no list controller instance');
        }
    }

    private send(channel: string, data?: any) {
        let success = false;
        while (!success) {
            try {
                ctx.postMessage(new WorkerTransfer(channel, JSON.stringify(data)));
                logger.log('info', 'worker send: ' + channel);
                success = true;
            } catch (err) {
                ctx.postMessage(new WorkerTransfer(channel, ''));
                logger.error(err);
            }
        }

    }
}
// tslint:disable-next-line: no-unused-expression
new ProviderController();

export default ProviderController;
