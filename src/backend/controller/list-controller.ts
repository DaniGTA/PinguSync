import ListProvider from '../api/provider/list-provider';
import MultiProviderResult from '../api/provider/multi-provider-result';
import ProviderComperator from '../helpFunctions/comperators/provider-comperator';
import NewProviderHelper from '../helpFunctions/provider/new-provider-helper';
import logger from '../logger/logger';
import MainListAdder from './main-list-manager/main-list-adder';
import MainListManager from './main-list-manager/main-list-manager';
import MainListPackageManager from './main-list-manager/main-list-package-manager';
import MainListEntryUpdater from './main-list-manager/main-list-updater';
import WatchProgress from './objects/meta/watch-progress';
import Series from './objects/series';
import ProviderList from './provider-controller/provider-manager/provider-list';

export default class ListController {

    public static instance: ListController | null = null;
    constructor(disableOnlineMode = false) {
        if (!ListController.instance) {
            logger.log('info', 'Start ListController.');
            if (!disableOnlineMode) {
                //this.getSeriesListAndUpdateMainList();
            }
            ListController.instance = this;
        }
    }

    public getSeriesById(id: string): Series | undefined {
        for (const entry of this.getMainList()) {
            // tslint:disable-next-line: triple-equals
            if (entry.id == id) {
                return entry;
            }
        }
        return;
    }

    public removeSeriesPackageFromMainList(id: string): void {
        MainListPackageManager.removeSeriesPackage(id, this.getMainList());
    }

    public async removeWatchProgress(anime: Series, watchProgress: WatchProgress): Promise<void> {
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
                logger.error('[ListController] [removeWatchProgress]: Failed remove watch progress');
            }
        }
    }
    public async updateWatchProgressTo(anime: Series, watchProgess: number): Promise<void> {
        if (anime.getListProvidersInfos().length < ProviderList.getListProviderList().length / 2) {
            try {
                await NewProviderHelper.getAllRelevantProviderInfosForSeries(anime);
            } catch (err) {
                logger.error('[ListController] [updateWatchProgressTo]: (see error next line)');
                logger.error('[ListController] [updateWatchProgressTo]: Update watch progress');
            }
        }
        for (const provider of anime.getListProvidersInfos()) {
            try {
                const providerInstance = provider.getProviderInstance();
                if (await providerInstance.isUserLoggedIn()) {
                    const newProvider = await providerInstance.updateEntry(anime, new WatchProgress(watchProgess));
                    newProvider.lastUpdate = new Date(Date.now());
                    const index = anime.getListProvidersInfos().findIndex((x) => x.provider === provider.provider);
                    anime.getListProvidersInfos()[index] = newProvider;
                }
            } catch (err) {
                logger.error('[ListController] [updateWatchProgressTo]: (see error next line)');
                logger.error(err);
            }
        }
        await this.addSeriesToMainList(anime);
    }

    public async addSeriesToMainList(...animes: Series[]): Promise<void> {
        logger.debug('Add ' + animes.length + ' to mainList');
        await new MainListAdder().addSeries(...animes);
    }

    public getMainList(): readonly Series[] {
        return Object.freeze([...MainListManager.getMainList()]);
    }

    /**
     * Download the info from all providers.
     * @param anime
     */
    public async forceRefreshProviderInfo(packageId: string): Promise<void> {
        const allSeriesInThePackage = (MainListManager.getMainList()).filter((x) => x.packageId === packageId);
        for (const series of allSeriesInThePackage) {
            const index = MainListManager.getIndexFromSeries(series);
            if (index !== -1) {
                try {
                    const mainList = MainListManager.getMainList();
                    const result = await NewProviderHelper.getAllRelevantProviderInfosForSeries((mainList)[index]);
                    this.addSeriesToMainList(result);
                } catch (err) {
                    logger.error('[ListController] [forceRefreshProviderInfo]: (see error next line)');
                    logger.error(err);
                }
            }
        }
    }

    public async getSeriesListAndUpdateMainList(): Promise<void> {
        logger.log('info', '[calc] -> SeriesList');
        const allSeries: MultiProviderResult[] = await this.getAllEntrysFromProviders(true);
        await new MainListEntryUpdater().updateSeries(...allSeries);
    }


    public async getAllEntrysFromProviders(forceDownload = false): Promise<MultiProviderResult[]> {
        const multiProviderResults: MultiProviderResult[] = [];
        for (const provider of ProviderList.getListProviderList()) {
            try {
                if (await provider.isUserLoggedIn()) {
                    logger.log('info', '[Request] -> ' + provider.providerName + ' -> AllSeries');
                    const allSeries = await provider.getAllSeries(forceDownload);
                    for (const iterator of allSeries) {
                        multiProviderResults.push(iterator);
                    }
                    logger.log('info', '[Request] -> result: ' + allSeries.length + ' items');

                }
            } catch (err) {
                logger.error('[Error] -> ' + provider.providerName + ' -> AllSeries');
                logger.error(err);
            }
        }
        return multiProviderResults;
    }


    public checkIfProviderExistInMainList(entry: Series, provider: ListProvider): Series {
        const validProvider = entry.getListProvidersInfos().find((x) => (x.provider === provider.providerName));
        try {
            if (validProvider) {
                for (const seriesMainListEntry of this.getMainList()) {
                    for (const oldprovider of seriesMainListEntry.getListProvidersInfos()) {
                        if (oldprovider.provider === validProvider.provider && ProviderComperator.simpleProviderIdCheck(oldprovider.id, validProvider.id)) {
                            return seriesMainListEntry;
                        }
                    }
                }
            }
        } catch (err) {
            logger.error('[ListController] [checkIfProviderExistInMainList]: (see error next line)');
            logger.error(err);
        }
        return entry;
    }
}
