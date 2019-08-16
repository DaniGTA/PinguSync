import FrontendController from './frontend-controller';
import Series from './objects/series';
import * as fs from "fs";
import * as path from "path";
import listHelper from '../helpFunctions/list-helper';
import ProviderList from './provider-manager/provider-list';
import WatchProgress from './objects/meta/watch-progress';
import ProviderHelper from '../helpFunctions/provider/provider-helper';
import ListProvider from '../api/list-provider';
import MainListManager from './main-list-manager';
export default class ListController {
    public static instance: ListController;
    constructor(forceLoading = !MainListManager.listLoaded) {
        ListController.instance = this;
        if (forceLoading) {
            this.addSeriesToMainList(...this.loadData());
            MainListManager.listLoaded = true;
            this.getSeriesListAndUpdateMainList();
        }
    }

    private async syncWatcher() {
        var needToSync: Series[] = [];
        for (const item of MainListManager.getMainList()) {
            if (await item.getCanSync()) {
                needToSync.push(item);
            }
        }
        if (typeof needToSync != 'undefined') {
            for (const item of needToSync) {
                await this.syncProvider(item);
            }
        }
    }

    public async syncProvider(anime: Series) {
        const watchProgress = await anime.getLastWatchProgress();
        this.updateWatchProgressTo(anime, watchProgress.episode);
    }

    public async removeWatchProgress(anime: Series, watchProgress: WatchProgress) {
        for (const provider of anime.getListProvidersInfos()) {
            try {
                const providerInstance = await provider.getProviderInstance();
                if (await providerInstance.isUserLoggedIn()) {
                    const newProvider = await providerInstance.removeEntry(anime, watchProgress);
                    newProvider.lastUpdate = new Date(Date.now());
                    var index = anime.getListProvidersInfos().findIndex(x => x.provider === provider.provider);
                    anime.getListProvidersInfos()[index] = newProvider;
                }
            } catch (err) {

            }
        }
    }
    public async updateWatchProgressTo(anime: Series, watchProgess: number) {
        if (anime.getListProvidersInfos().length < ProviderList.getListProviderList().length / 2) {
            try {
                await this.fillMissingProvider(anime);
            } catch (err) { }
        }
        for (const provider of anime.getListProvidersInfos()) {
            try {
                const providerInstance = await provider.getProviderInstance();
                if (await providerInstance.isUserLoggedIn()) {
                    const newProvider = await providerInstance.updateEntry(anime, new WatchProgress(watchProgess))
                    newProvider.lastUpdate = new Date(Date.now());
                    var index = anime.getListProvidersInfos().findIndex(x => x.provider === provider.provider);
                    anime.getListProvidersInfos()[index] = newProvider;
                }
            } catch (err) {
                console.log(err);
            }
        }

        this.saveData(MainListManager.getMainList());
        await this.addSeriesToMainList(anime);
    }

    public async addSeriesToMainList(...animes: Series[]) {
        console.log('Add ' + animes.length + ' to mainList');
        for (const anime of animes) {
            await MainListManager.addSerieToMainList(anime);
            const entry = await MainListManager.findSameSeriesInMainList(anime);
            if (entry.length != 1) {
                console.log("[WARN] Find more or none entry after adding it.");
            } else {
                var index = await MainListManager.getIndexFromSeries(entry[0]);
                try {
                    await MainListManager.addSerieToMainList(await this.fillMissingProvider(entry[0]));
                    this.saveData(MainListManager.getMainList());
                } catch (err) { }
            }
        }
        console.log('Added ' + MainListManager.getMainList().length + ' to mainList');
        if (animes.length > 2) {
            try {
                FrontendController.getInstance().sendSeriesList();
            } catch (err) { }
        }
    }


    public getMainList(): Series[] {
        return MainListManager.getMainList();
    }

    /**
     * Download the info from all providers.
     * @param anime 
     */
    public async forceRefreshProviderInfo(packageId: string) {
        const allSeriesInThePackage = MainListManager.getMainList().filter(x => x.packageId === packageId);
        for (const series of allSeriesInThePackage) {
            const index = await MainListManager.getIndexFromSeries(series);
            if (index != -1) {
                try {
                    var result = await this.fillMissingProvider(MainListManager.getMainList()[index], true);
                    this.addSeriesToMainList(result);
                } catch (err) {
                    console.log(err);
                }
            }
        }
    }

    public async getSeriesListAndUpdateMainList(): Promise<void> {
        console.log('[calc] -> SeriesList');
        let allSeries: Series[] = await this.getAllEntrysFromProviders(true);

        await this.addSeriesToMainList(...allSeries);
    }


    public async getAllEntrysFromProviders(forceDownload: boolean = false): Promise<Series[]> {
        const anime: Series[] = [];
        for (const provider of ProviderList.getListProviderList()) {
            try {
                if (await provider.isUserLoggedIn()) {
                    console.log('[Request] -> ' + provider.providerName + ' -> AllSeries');
                    const allSeries = await provider.getAllSeries(forceDownload);
                    for (const iterator of allSeries) {
                        anime.push(Object.assign(new Series(), iterator));
                    }
                    console.log('[Request] -> result: ' + allSeries.length + ' items');

                }
            } catch (err) {
                console.log('[Error] -> ' + provider.providerName + ' -> AllSeries');
            }
        }
        return anime;
    }

    private async fillMissingProvider(entry: Series, forceUpdate = false, offlineOnly = false): Promise<Series> {
        if (new Date().getTime() - entry.lastInfoUpdate > new Date(0).setHours(1920) || forceUpdate) {
            entry = await this.updateInfoProviderData(entry);
            if (!offlineOnly) {
                try {
                    entry = await ProviderHelper.fillListProvider(entry);
                } catch (err) {
                    console.log(err);
                }
                entry.lastInfoUpdate = Date.now();
            }
        }
        return entry;
    }

    public async checkIfProviderExistInMainList(entry: Series, provider: ListProvider): Promise<Series> {
        var validProvider = entry.getListProvidersInfos().find(x => (x.id && x.id));
        try {
            if (validProvider) {
                for (const anime of this.getMainList()) {
                    for (const oldprovider of anime.getListProvidersInfos()) {
                        if (oldprovider.provider == validProvider.provider && oldprovider.id == validProvider.id) {
                            if (oldprovider.lastUpdate < validProvider.lastUpdate || oldprovider.lastUpdate) {
                                var providerInfos = await listHelper.removeEntrys(entry.getListProvidersInfos(), oldprovider);
                                providerInfos.push(validProvider);
                                entry.addListProvider(...providerInfos);
                            }
                            var findSearchedProvider = anime.getListProvidersInfos().find(x => x.provider === provider.providerName);
                            if (findSearchedProvider) {
                                if (new Date(findSearchedProvider.lastUpdate).getMilliseconds() < new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).getMilliseconds() && findSearchedProvider.hasFullInfo) {
                                    break;
                                }
                            } else {
                                break;
                            }
                        }
                    }
                }
            }
        } catch (err) { }
        return entry;
    }

    private async updateInfoProviderData(series: Series, forceUpdate = false, offlineOnly = false): Promise<Series> {
        for (const infoProvider of ProviderList.getInfoProviderList()) {
            if (offlineOnly) {
                if (!infoProvider.isOffline) {
                    continue;
                }
            }
            try {
                const index = series.getInfoProvidersInfos().findIndex(entry => infoProvider.providerName == entry.provider);
                if (index != -1) {
                    const provider = series.getInfoProvidersInfos()[index];
                    if (new Date().getTime() - new Date(provider.lastUpdate).getTime() < new Date(0).setHours(72) || forceUpdate) {
                        const data = await ProviderHelper.getProviderSeriesInfoByName(series, infoProvider);
                        series = await series.merge(data);
                    }
                } else {
                    const data = await ProviderHelper.getProviderSeriesInfoByName(series, infoProvider);
                    series = await series.merge(data);
                }
            } catch (err) {
                console.log(err);
            }
        }
        return series;
    }





    private async saveData(list: Series[]) {
        console.log('Save list');
        console.log(this.getPath());
        fs.writeFileSync(this.getPath(), JSON.stringify(list));
    }

    private loadData(): Series[] {
        try {
            if (fs.existsSync(this.getPath())) {
                const loadedString = fs.readFileSync(this.getPath(), 'UTF-8');
                const loadedData = JSON.parse(loadedString) as Series[];
                for (let data of loadedData) {
                    data = Object.assign(new Series(), data);
                    data.readdFunctions();
                }
                return loadedData;
            }
        } catch (err) {
            console.log(err);
            return [];
        }
        return [];
    }

    private getPath(): string {
        const userDataPath = './';
        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        return path.join(userDataPath, 'list.json');
    }
}
