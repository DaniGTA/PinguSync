import ListProvider from '../api/ListProvider';
import ListController from './listController';
import Anime from './objects/anime';
import IUpdateList from './objects/iupdateList';
import ProviderList from './providerList';
import { ipcMain } from 'electron';

class ProviderController {
    public static getInstance(): ProviderController {
        return ProviderController.instance;
    }

    private static instance: ProviderController;

    private path: string | null = null;
    private webcontents: Electron.WebContents;
    constructor(webcontents: Electron.WebContents) {
        this.webcontents = webcontents;
        const that = this;

        if (typeof ProviderController.instance === 'undefined') {
            this.initController()

            ProviderController.instance = that;
            for (const pl of ProviderList.list) {
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
    }

    public initController() {
        this.on('get-series-list', () => {
            this.sendSeriesList();
        });
        this.on('request-info-refresh', (data) => {
            new ListController().forceRefreshProviderInfo(data);
        });
        this.on('get-all-providers', (data) => {
            this.send('all-providers', ProviderList.list.flatMap(x => x.providerName));
        });
        this.on('sync-series', (data) => {
            this.syncSeries(data);
        });
    }

    private send(channel: string, data?: any) {
        let success = false;
        while (!success) {
            try {
                this.webcontents.send(channel, data);
                console.log("worker send: " + channel);
                success = true;
            } catch (err) {
                this.webcontents.send(channel);
                console.log(err);
            }
        }

    }

    static getProviderInstance(providerString: string): ListProvider {
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

    public getPath(): string {
        return (process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + 'Library/Preferences' : process.env.HOME + "/.local/share")) + '/list-manager/'

    }

    public async updateClientList(targetIndex: number, updatedEntry: Anime) {
        console.log('[Send] -> update -> anime');
        this.send('update-series-list', { targetIndex, updatedEntry } as IUpdateList);
    }

    public async on(channel: string, f: (data: any) => void) {
        ipcMain.on(channel, (event: Electron.IpcMainEvent, data: any) => {
            console.log('recieved: ' + channel)
            try {
                f(JSON.parse(data));
            } catch (err) {
                f(data);
            }
        })
    }
}

export default ProviderController;
