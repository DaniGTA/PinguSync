import ListProvider from '../api/list-provider';
import ListController from './list-controller';
import Series from './objects/series';
import IUpdateList from './objects/update-list';
import ProviderList from './provider-list';
import IPCBackgroundController from '../communication/ipc-background-controller';
import ICommunication from '../communication/icommunication';
import SeriesPackage from './objects/series-package';

class FrontendController {
    public static getInstance(): FrontendController {
        return FrontendController.instance;
    }

    private static instance: FrontendController;

    private path: string | null = null;
    private communcation: ICommunication = new IPCBackgroundController({} as Electron.WebContents);;
    constructor(webcontents?: Electron.WebContents) {
        if (webcontents) {
            this.mainInit(webcontents);
        }
    }

    public mainInit(webcontents: Electron.WebContents) {
        this.communcation = new IPCBackgroundController(webcontents);
        const that = this;

        if (typeof FrontendController.instance === 'undefined' && this.communcation) {
            this.initController()

            FrontendController.instance = that;
            for (const pl of ProviderList.listProviderList) {
                if (pl.hasOAuthCode) {
                    this.communcation.on(pl.providerName.toLocaleLowerCase() + '-auth-code', async (code: string) => {
                        try {
                            await pl.logInUser(code);
                            that.communcation.send(pl.providerName.toLocaleLowerCase() + '-auth-status', await pl.isUserLoggedIn());
                        } catch (err) { }
                    });
                    this.communcation.on(pl.providerName.toLocaleLowerCase() + '-open-code-url', async (code: string) => {
                        that.communcation.send('open-url', pl.getTokenAuthUrl());
                    });
                }
                this.communcation.on(pl.providerName.toLocaleLowerCase() + '-is-logged-in', async (code: string) => {
                    try {
                        that.communcation.send(pl.providerName.toLocaleLowerCase() + '-auth-status', await pl.isUserLoggedIn());
                    } catch (err) { }
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
            new ListController().forceRefreshProviderInfo(data);
        });

        this.communcation.on('get-all-providers', (data) => {
            this.communcation.send('all-providers', ProviderList.listProviderList.flatMap(x => x.providerName));
        });

        this.communcation.on('sync-series', (data) => {
            this.syncSeries(data);
        });

        this.communcation.on('anime-update-watch-progress', async (data) => {
            const lc = new ListController();
            const anime: Series = Object.assign(new Series(), data.anime);
            console.log(data);
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
        });
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

    public async removeEntryFromList(index: number) {
        this.communcation.send('series-list-remove-entry', index);
    }

    public async sendSeriesList() {
        console.log('[Send] -> list -> anime');
        var list = await new ListController().getSeriesPackages();
        this.communcation.send('series-list', list);
    }

    public getPath(): string {
        return (process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + 'Library/Preferences' : process.env.HOME + "/.local/share")) + '/list-manager/'

    }

    public async updateClientList(targetIndex: number, updatedEntry: SeriesPackage) {
        console.log('[Send] -> update -> anime');
        this.communcation.send('update-series-list', { targetIndex, updatedEntry } as IUpdateList);
    }
}

export default FrontendController;
