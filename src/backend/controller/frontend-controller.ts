import ListProvider from '../api/provider/list-provider';
import ICommunication from '../communication/icommunication';
import IPCBackgroundController from '../communication/ipc-background-controller';
import logger from '../logger/logger';
import ListController from './list-controller';
import MainListPackageManager from './main-list-manager/main-list-package-manager';
import Series from './objects/series';
import SeriesPackage from './objects/series-package';
import IUpdateList from './objects/update-list';
import ProviderList from './provider-manager/provider-list';

class FrontendController {

    public static getInstance(): FrontendController {
        return FrontendController.instance;
    }
    public static getProviderInstance(providerString: string): ListProvider {
        for (const provider of ProviderList.getListProviderList()) {
            if (provider.providerName === providerString) {
                return provider;
            }
        }
        throw new Error('NoProviderFound');
    }

    private static instance: FrontendController;

    private communcation: ICommunication = new IPCBackgroundController({} as Electron.WebContents); constructor(webcontents?: Electron.WebContents) {
        logger.log('info', 'Load list controller');
        // tslint:disable-next-line: no-unused-expression
        new ListController();
        if (webcontents) {
            this.mainInit(webcontents);
        }
    }



    public mainInit(webcontents: Electron.WebContents) {
        this.communcation = new IPCBackgroundController(webcontents);
        const that = this;

        if (typeof FrontendController.instance === 'undefined' && this.communcation) {
            this.initController();

            FrontendController.instance = that;
            for (const pl of ProviderList.getListProviderList()) {
                if (pl.hasOAuthCode) {
                    this.communcation.on(pl.providerName.toLocaleLowerCase() + '-auth-code', async (code: string) => {
                        try {
                            await pl.logInUser(code);
                            that.communcation.send(pl.providerName.toLocaleLowerCase() + '-auth-status', await pl.isUserLoggedIn());
                        } catch (err) {
                            logger.error(err);
                        }
                    });
                    this.communcation.on(pl.providerName.toLocaleLowerCase() + '-open-code-url', async (code: string) => {
                        that.communcation.send('open-url', pl.getTokenAuthUrl());
                    });
                }
                this.communcation.on(pl.providerName.toLocaleLowerCase() + '-is-logged-in', async (code: string) => {
                    try {
                        that.communcation.send(pl.providerName.toLocaleLowerCase() + '-auth-status', await pl.isUserLoggedIn());
                    } catch (err) {
                        logger.error(err);
                    }
                });
            }

            this.communcation.send('status');
        }
    }

    public initController() {
        this.communcation.on('get-series-list', async () => {
            this.sendSeriesList();
        });

        this.communcation.on('request-info-refresh', (data: string) => {
            if (ListController.instance) {
                ListController.instance.forceRefreshProviderInfo(data);
            } else {
                logger.log('info', 'Failed to request info: no provider instance');
            }
        });

        this.communcation.on('get-all-providers', (data) => {
            this.communcation.send('all-providers', ProviderList.getListProviderList().flatMap((x) => x.providerName));
        });

        this.communcation.on('sync-series', (data) => {
            this.syncSeries(data);
        });

        this.communcation.on('delete-series-package', (data: string) => {
            if (ListController.instance) {
                ListController.instance.removeSeriesPackageFromMainList(data);
            } else {
                logger.error('Failed to remove package: no provider instance');
            }
        });


        this.communcation.on('anime-update-watch-progress', async (data) => {
            if (ListController.instance) {
                const lc = ListController.instance;
                const anime: Series = Object.assign(new Series(), data.anime);
                logger.log('info', data);
                anime.readdFunctions();
                if (data.reduce) {
                    lc.removeWatchProgress(anime, await anime.getLastWatchProgress());
                } else {
                    const watchProgress = await anime.getLastWatchProgress();
                    if (watchProgress) {
                        lc.updateWatchProgressTo(anime, watchProgress.episode++);
                    } else {
                        lc.updateWatchProgressTo(anime, 1);
                    }
                }
            } else {
                logger.log('info', 'Failed to update watch progress: no provider instance');
            }
        });
    }

    public async removeEntryFromList(index: number) {
        this.communcation.send('series-list-remove-entry', index);
    }

    public async sendSeriesList() {
        logger.log('info', '[Send] -> list -> anime');
        if (ListController.instance) {
            const list = await new MainListPackageManager().getSeriesPackages(await ListController.instance.getMainList());
            this.communcation.send('series-list', list);
        } else {
            logger.log('info', 'Failed to send list: no provider instance');
        }
    }

    public getPath(): string {
        return (process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + 'Library/Preferences' : process.env.HOME + '/.local/share')) + '/list-manager/';

    }

    public async updateClientList(targetIndex: number, updatedEntry: SeriesPackage) {
        logger.log('info', '[Send] -> update -> anime');
        this.communcation.send('update-series-list', { targetIndex, updatedEntry } as IUpdateList);
    }

    private async syncSeries(id: string | number) {
        if (ListController.instance) {
            const lc = ListController.instance;
            const anime = (await lc.getMainList()).find((x) => x.id === id);
            if (anime) {
                lc.syncProvider(anime);
            } else {
                logger.error('Error on sync series');
            }
        } else {
            logger.error('Failed sync series: no list provider instance');
        }
    }
}

export default FrontendController;
