import ListProvider from '../api/ListProvider';
import aniListProvider from '../api/anilist/aniListProvider';
import { ipcMain, shell } from 'electron';
import ListController from './listController';
import KitsuProvider from '../api/kitsu/kitsuProvider';
import TraktProvider from '../api/trakt/traktProvider';
import Anime from './objects/anime';
import IUpdateList from './objects/iupdateList';

class ProviderController {
    public static getInstance(): ProviderController {
        return ProviderController.instance;
    }

    private static instance: ProviderController;
    /**
     * List all Providers that are avaible
     */
    public list: ListProvider[] = [
        new aniListProvider(),
        new TraktProvider(),
        new KitsuProvider()];

    private webcontent: Electron.WebContents;

    constructor(webcontent: Electron.WebContents) {
        const that = this;
        ProviderController.instance = that;
        this.webcontent = webcontent;
    }

    public initController() {
        const that = this;
        for (const provider of that.list) {
            that.initProvider(provider);
        }

        ipcMain.on('get-all-providers', (event: any) => {
            const names: string[] = [];
            for (const provider of that.list) {
                names.push(provider.providerName);
            }
            console.log('Send all Providers');
            that.webcontent.send('all-providers', names);
        });

        ipcMain.on('get-series-list', async (event: any) => {
            console.log('Send all Series');
            that.sendSeriesList();
        });
        ipcMain.on('request-info-refresh', async (event: any, anime: Anime) => {
            console.log('updateAnime: ' + anime.id);
            new ListController().forceRefreshProviderInfo(anime);
        });
    }

    private async sendSeriesList() {
        var list = new ListController().getMainList();
        this.webcontent.send('series-list', list);
    }

    public async updateClientList(targetIndex: number, updatedEntry: Anime) {
        console.log('[Send] -> update -> anime');
        this.webcontent.send('update-series-list', { targetIndex, updatedEntry } as IUpdateList);
    }


    private async initProvider(provider: ListProvider) {
        if (provider.hasOAuthCode) {
            ipcMain.on(provider.providerName.toLocaleLowerCase() + '-open-code', (event: any, code: string) => {
                shell.openExternal(provider.getTokenAuthUrl());
            });
            ipcMain.on(provider.providerName.toLocaleLowerCase() + '-auth-code', async (event: any, code: string) => {
                // tslint:disable-next-line: no-console
                console.log(provider.providerName + ' log in user with code: ' + code);
                await provider.logInUser(code);
                this.webcontent.send(provider.providerName.toLocaleLowerCase() + '-auth-status'
                    , await provider.isUserLoggedIn());
            });
        }
        ipcMain.on(provider.providerName.toLocaleLowerCase() + '-is-logged-in', async () => {
            this.webcontent.send(provider.providerName.toLocaleLowerCase() + '-auth-status'
                , await provider.isUserLoggedIn());
        });
    }

}
export default ProviderController;
