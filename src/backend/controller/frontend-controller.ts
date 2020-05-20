import ListProvider from '../api/provider/list-provider';
import ICommunication from '../communication/icommunication';
import IPCBackgroundController from '../communication/ipc-background-controller';
import logger from '../logger/logger';
import ListController from './list-controller';
import MainListPackageManager from './main-list-manager/main-list-package-manager';
import Series from './objects/series';
import SeriesPackage from './objects/series-package';
import IUpdateList from './objects/update-list';
import ProviderList from './provider-controller/provider-manager/provider-list';
import FrontendCommmunicationEventController from './frontend/frontend-communication-event-controller';

export default class FrontendController {

    public static getInstance(): FrontendController {
        return FrontendController.instance;
    }
    public static getProviderInstance(providerString: string): ListProvider {
        for (const provider of ProviderList.getListProviderList()) {
            if (provider.providerName === providerString) {
                return provider;
            }
        }
        throw new Error('[FrontendController] NoProviderFound: ' + providerString);
    }

    private static instance: FrontendController;

    // tslint:disable-next-line: no-object-literal-type-assertion
    private communcation: ICommunication = new IPCBackgroundController({} as Electron.WebContents);

    constructor(webcontents?: Electron.WebContents) {
        logger.log('info', 'Load list controller');
        // tslint:disable-next-line: no-unused-expression
        new ListController();
        if (webcontents) {
            this.mainInit(webcontents);
        }
    }



    public mainInit(webcontents: Electron.WebContents): void {
        this.communcation = new IPCBackgroundController(webcontents);
        // tslint:disable-next-line: no-unused-expression
        new FrontendCommmunicationEventController(webcontents);
        // tslint:disable-next-line: no-this-assignment
        const that = this;

        if (typeof FrontendController.instance === 'undefined' && this.communcation) {
            this.initController();

            FrontendController.instance = that;
            for (const pl of ProviderList.getListProviderList()) {
                if (pl.hasOAuthLogin) {
                    this.communcation.on(pl.providerName.toLocaleLowerCase() + '-auth-code', async (code: string) => {
                        try {
                            await pl.logInUser(code);
                            that.communcation.send(pl.providerName.toLocaleLowerCase() + '-auth-status', await pl.isUserLoggedIn());
                        } catch (err) {
                            logger.error('Error at FrontendController.mainInit #1');
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
                        logger.error('Error at FrontendController.mainInit #2');
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
            const seriesList = ListController.instance.getMainList();
            const packagelist = await MainListPackageManager.getSeriesPackages(seriesList);
            this.communcation.send('series-list', packagelist);
        } else {
            logger.log('info', 'Failed to send list: no provider instance');
        }
    }

    public getPath(): string {
        // eslint-disable-next-line no-undef
        return (process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + 'Library/Preferences' : process.env.HOME + '/.local/share')) + '/list-manager/';

    }

    public async updateClientList(targetIndex: number, updatedEntry: SeriesPackage) {
        logger.log('info', '[Send] -> update -> anime');
        // tslint:disable-next-line: no-object-literal-type-assertion
        this.communcation.send('update-series-list', { targetIndex, updatedEntry } as IUpdateList);
    }

    private async syncSeries(id: string | number) {
        if (ListController.instance) {
            const lc = ListController.instance;
            const anime = (lc.getMainList()).find((x) => x.id === id);
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
