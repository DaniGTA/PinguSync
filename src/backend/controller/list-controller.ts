import IListProvider from '../api/list-provider';
import providerHelper from '../helpFunctions/provider/provider-helper';
import logger from '../logger/logger';
import MainListAdder from './main-list-manager/main-list-adder';
import MainListManager from './main-list-manager/main-list-manager';
import MainListPackageManager from './main-list-manager/main-list-package-manager';
import WatchProgress from './objects/meta/watch-progress';
import Series from './objects/series';
import ProviderList from './provider-manager/provider-list';
export default class ListController {

    public static instance: ListController | null = null;
    constructor(disableOnlineMode = false) {
        if (!ListController.instance) {
           logger.log('info', 'Start ListController.');
           if (!disableOnlineMode) {
                this.getSeriesListAndUpdateMainList();
            }
           ListController.instance = this;
        }
    }

    public async getSeriesById(id: string): Promise<Series | undefined> {
        for (const entry of await this.getMainList()) {
            // tslint:disable-next-line: triple-equals
            if (entry.id == id) {
                return entry;
            }
        }
        return;
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
                const providerInstance = provider.getProviderInstance();
                if (await providerInstance.isUserLoggedIn()) {
                    const newProvider = await providerInstance.removeEntry(anime, watchProgress);
                    newProvider.lastUpdate = new Date(Date.now());
                    const index = anime.getListProvidersInfos().findIndex((x) => x.provider === provider.provider);
                    anime.getListProvidersInfos()[index] = newProvider;
                }
            } catch (err) {
               logger.error('Failed remove watch progress');
            }
        }
    }
    public async updateWatchProgressTo(anime: Series, watchProgess: number) {
        if (anime.getListProvidersInfos().length < ProviderList.getListProviderList().length / 2) {
            try {
                await providerHelper.fillMissingProvider(anime);
            } catch (err) {
               logger.error('Update watch progress');
            }
        }
        for (const provider of anime.getListProvidersInfos()) {
            try {
                const providerInstance = await provider.getProviderInstance();
                if (await providerInstance.isUserLoggedIn()) {
                    const newProvider = await providerInstance.updateEntry(anime, new WatchProgress(watchProgess));
                    newProvider.lastUpdate = new Date(Date.now());
                    const index = anime.getListProvidersInfos().findIndex((x) => x.provider === provider.provider);
                    anime.getListProvidersInfos()[index] = newProvider;
                }
            } catch (err) {
               logger.error(err);
            }
        }
        await this.addSeriesToMainList(anime);
    }

    public async addSeriesToMainList(...animes: Series[]) {
       logger.log('info', 'Add ' + animes.length + ' to mainList');
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
        const allSeriesInThePackage = (await MainListManager.getMainList()).filter((x) => x.packageId === packageId);
        for (const series of allSeriesInThePackage) {
            const index = await MainListManager.getIndexFromSeries(series);
            if (index !== -1) {
                try {
                    const mainList = await MainListManager.getMainList();
                    const result = await providerHelper.fillMissingProvider((mainList)[index], true);
                    this.addSeriesToMainList(result);
                } catch (err) {
                   logger.log('info', err);
                }
            }
        }
    }

    public async getSeriesListAndUpdateMainList(): Promise<void> {
        logger.log('info', '[calc] -> SeriesList');
        await this.getMainList();
        const allSeries: Series[] = await this.getAllEntrysFromProviders(true);

        await this.addSeriesToMainList(...allSeries);
    }


    public async getAllEntrysFromProviders(forceDownload: boolean = false): Promise<Series[]> {
        const anime: Series[] = [];
        for (const provider of ProviderList.getListProviderList()) {
            try {
                if (await provider.isUserLoggedIn()) {
                   logger.log('info', '[Request] -> ' + provider.providerName + ' -> AllSeries');
                   const allSeries = await provider.getAllSeries(forceDownload);
                   for (const iterator of allSeries) {
                        anime.push(Object.assign(new Series(), iterator));
                    }
                   logger.log('info', '[Request] -> result: ' + allSeries.length + ' items');

                }
            } catch (err) {
               logger.log('info', '[Error] -> ' + provider.providerName + ' -> AllSeries');
            }
        }
        return anime;
    }


    public async checkIfProviderExistInMainList(entry: Series, provider: IListProvider): Promise<Series> {
        const validProvider = entry.getListProvidersInfos().find((x) => (x.provider === provider.providerName));
        try {
            if (validProvider) {
                for (const seriesMainListEntry of await this.getMainList()) {
                    for (const oldprovider of seriesMainListEntry.getListProvidersInfos()) {
                        // tslint:disable-next-line: triple-equals
                        if (oldprovider.provider == validProvider.provider && oldprovider.id == validProvider.id) {
                            return seriesMainListEntry;
                        }
                    }
                }
            }
        } catch (err) {
           logger.error(err);
        }
        return entry;
    }


    private async syncWatcher() {
        const needToSync: Series[] = [];
        for (const item of await MainListManager.getMainList()) {
            if (await item.getCanSync()) {
                needToSync.push(item);
            }
        }
        if (typeof needToSync !== 'undefined') {
            for (const item of needToSync) {
                await this.syncProvider(item);
            }
        }
    }

}
