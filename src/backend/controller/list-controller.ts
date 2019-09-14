import Series from './objects/series';
import ProviderList from './provider-manager/provider-list';
import WatchProgress from './objects/meta/watch-progress';
import ListProvider from '../api/list-provider';
import MainListManager from './main-list-manager/main-list-manager';
import providerHelper from '../helpFunctions/provider/provider-helper';
import MainListAdder from './main-list-manager/main-list-adder';
import MainListPackageManager from './main-list-manager/main-list-package-manager';
export default class ListController {

    public static instance: ListController | null = null;
    constructor(disableOnlineMode = false) {
        if (!ListController.instance) {
            console.log('Start ListController.')
            if (!disableOnlineMode) {
                this.getSeriesListAndUpdateMainList();
            }
            ListController.instance = this;
        }
    }

    private async syncWatcher() {
        var needToSync: Series[] = [];
        for (const item of await MainListManager.getMainList()) {
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

    public async removeSeriesPackageFromMainList(id: string) {
        await new MainListPackageManager().removeSeriesPackage(id, await this.getMainList());
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
                await providerHelper.fillMissingProvider(anime);
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
        await this.addSeriesToMainList(anime);
    }

    public async addSeriesToMainList(...animes: Series[]) {
        console.log('Add ' + animes.length + ' to mainList');
        await new MainListAdder().addSeries(...animes);
    }

    public async getMainList(): Promise<readonly Series[]> {
        return Object.freeze([...await MainListManager.getMainList()]);
    }

    /**
     * Download the info from all providers.
     * @param anime 
     */
    public async forceRefreshProviderInfo(packageId: string) {
        const allSeriesInThePackage = (await MainListManager.getMainList()).filter(x => x.packageId === packageId);
        for (const series of allSeriesInThePackage) {
            const index = await MainListManager.getIndexFromSeries(series);
            if (index != -1) {
                try {
                    var result = await providerHelper.fillMissingProvider((await MainListManager.getMainList())[index], true);
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


    public async checkIfProviderExistInMainList(entry: Series, provider: ListProvider): Promise<Series> {
        var validProvider = entry.getListProvidersInfos().find(x => (x.provider == provider.providerName));
        try {
            if (validProvider) {
                for (const seriesMainListEntry of await this.getMainList()) {
                    for (const oldprovider of seriesMainListEntry.getListProvidersInfos()) {
                        if (oldprovider.provider == validProvider.provider && oldprovider.id == validProvider.id) {
                            return seriesMainListEntry;
                        }
                    }
                }
            }
        } catch (err) { }
        return entry;
    }


}
