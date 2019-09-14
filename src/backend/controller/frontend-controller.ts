import ListProvider from '../api/list-provider';
import ListController from './list-controller';
import Series from './objects/series';
import IUpdateList from './objects/update-list';
import ProviderList from './provider-manager/provider-list';
import IPCBackgroundController from '../communication/ipc-background-controller';
import ICommunication from '../communication/icommunication';
import SeriesPackage from './objects/series-package';
import MainListPackageManager from './main-list-manager/main-list-package-manager';

class FrontendController {
    public static getInstance(): FrontendController {
        return FrontendController.instance;
    }

    private static instance: FrontendController;
    
    private communcation: ICommunication = new IPCBackgroundController({} as Electron.WebContents);;
    constructor(webcontents?: Electron.WebContents) {
        console.log('Load list controller');
        new ListController();
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
            for (const pl of ProviderList.getListProviderList()) {
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
            if (ListController.instance) {
                ListController.instance.forceRefreshProviderInfo(data);
            } else {
                 console.log('Failed to request info: no provider instance');
            }
        });

        this.communcation.on('get-all-providers', (data) => {
            this.communcation.send('all-providers', ProviderList.getListProviderList().flatMap(x => x.providerName));
        });

        this.communcation.on('sync-series', (data) => {
            this.syncSeries(data);
        });

        this.communcation.on('delete-series-package', (data:string) => {
            if (ListController.instance) {
                ListController.instance.removeSeriesPackageFromMainList(data)
            } else {
                console.log('Failed to remove package: no provider instance')
            }
        });


        this.communcation.on('anime-update-watch-progress', async (data) => {
            if (ListController.instance) {
                const lc = ListController.instance;
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
            }else {
                console.log('Failed to update watch progress: no provider instance');
            }
        });
    }

    static getProviderInstance(providerString: string): ListProvider {
        for (const provider of ProviderList.getListProviderList()) {
            if (provider.providerName === providerString) {
                return provider;
            }
        }
        throw 'NoProviderFound';
    }

    private async syncSeries(id: string | number) {
        if (ListController.instance) {
            var lc = ListController.instance;
            var anime = (await lc.getMainList()).find(x => x.id === id);
            if (typeof anime != 'undefined') {
                lc.syncProvider(anime);
            } else {
                console.log('Error');
            }
        } else {
            console.log('Failed sync series: no list provider instance');
        }
    }

    public async removeEntryFromList(index: number) {
        this.communcation.send('series-list-remove-entry', index);
    }

    public async sendSeriesList() {
        console.log('[Send] -> list -> anime');
        if (ListController.instance) {
            var list = await new MainListPackageManager().getSeriesPackages(await ListController.instance.getMainList());
            this.communcation.send('series-list', list);
        } else {
            console.log('Failed to send list: no provider instance')
        }
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
