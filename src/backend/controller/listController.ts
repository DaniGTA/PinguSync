import FrontendController from './frontendController';
import Series from './objects/series';
import * as fs from "fs";
import * as path from "path";
import listHelper from '../helpFunctions/listHelper';
import timeHelper from '../helpFunctions/timeHelper';
import ProviderList from './provider-list';
import WatchProgress from './objects/meta/watchProgress';
import SeriesPackage from './objects/seriesPackage';
import ProviderHelper from '../helpFunctions/provider/providerHelper';
import seriesHelper from '../helpFunctions/seriesHelper';
import ListProvider from '../api/ListProvider';
export default class ListController {
    private static mainList: Series[] = [];
    static listLoaded = false;
    constructor(forceLoading = !ListController.listLoaded) {

        if (forceLoading) {
            ListController.mainList = this.loadData();
            ListController.listLoaded = true;
            this.getSeriesListAndUpdateMainList();
        }
    }

    private async syncWatcher() {
        var needToSync: Series[] = [];
        for (const item of ListController.mainList) {
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

    public async getSeriesPackage(series: Series): Promise<SeriesPackage> {
        if (series.packageId) {
            const allSeriesInThePackage = ListController.mainList.filter(x => x.packageId === series.packageId);
            const seriesPackage = new SeriesPackage(...allSeriesInThePackage);
            seriesPackage.id = series.packageId;
            return seriesPackage;
        } else {
            return this.createPackage(series);
        }
    }

    public async getSeriesPackages(): Promise<SeriesPackage[]> {
        let tempList = [...this.getMainList()];

        const seriesPackageList: SeriesPackage[] = [];

        for (let entry of tempList) {
            try {
                const tempPackage = await this.createPackage(entry, tempList);
                tempList = await listHelper.removeEntrys(tempList, ...tempPackage.allRelations);
                seriesPackageList.push(tempPackage);
            } catch (err) { }
        }
        return seriesPackageList;
    }

    private async createPackage(series: Series, list: Series[] = ListController.mainList): Promise<SeriesPackage> {
        try {
            series = Object.assign(new Series(), series);
            const relations = await series.getAllRelations(list, true);
            const tempPackage = new SeriesPackage(...relations);

            for (const relation of relations) {
                const index = ListController.mainList.findIndex(x => x.id === relation.id);
                if (index != -1) {
                    relation.packageId = tempPackage.id;
                    ListController.mainList[index] = relation;
                }
            }
            return tempPackage;
        } catch (err) {
            console.error("Cant create package for: ")
            console.error(series);
            throw "cant create package";
        }
    }

    public async removeWatchProgress(anime: Series, watchProgress: WatchProgress) {
        for (const provider of anime.getListProvidersInfos()) {
            try {
                const providerInstance = await provider.getListProviderInstance();
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
        if (anime.getListProvidersInfos().length < ProviderList.listProviderList.length / 2) {
            try {
                await this.fillMissingProvider(anime);
            } catch (err) { }
        }
        for (const provider of anime.getListProvidersInfos()) {
            try {
                const providerInstance = await provider.getListProviderInstance();
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

        this.saveData(ListController.mainList);
        await this.addSeriesToMainList(anime);
    }

    public async addSeriesToMainList(...animes: Series[]) {
        console.log('Add ' + animes.length + ' to mainList');
        for (const anime of animes) {
            await this.addSerieToMainList(anime);
            const entry = await this.findSameSeriesInMainList(anime);
            if (entry.length != 1) {
                console.log("[WARN] Find more or none entry after adding it.");
            } else {
                var index = await this.getIndexFromSeries(entry[0]);
                try {
                    await this.addSerieToMainList(await this.fillMissingProvider(entry[0]));
                    this.saveData(ListController.mainList);
                } catch (err) { }
            }
        }
        console.log('Added ' + ListController.mainList.length + ' to mainList');
        if (animes.length > 2) {
            try {
                FrontendController.getInstance().sendSeriesList();
            } catch (err) { }
        }
    }

    private async findSameSeriesInMainList(entry2: Series): Promise<Series[]> {
        const foundedSameSeries = [];
        for (let entry of ListController.mainList) {
            if (entry.id === entry2.id) {
                foundedSameSeries.push(entry);
            } else {
                if (await seriesHelper.isSameSeries(entry, entry2)) {
                    foundedSameSeries.push(entry);
                }

            }
        }
        return foundedSameSeries;
    }

    public async removeSeriesFromMainList(anime: Series, notifyRenderer = false): Promise<boolean> {
        const index = await this.getIndexFromSeries(anime);
        if (index != -1) {
            ListController.mainList = await listHelper.removeEntrys(ListController.mainList, ListController.mainList[index]);
            if (notifyRenderer) {
                FrontendController.getInstance().removeEntryFromList(index);
            }
            return true;
        }
        return false;
    }

    public async addSerieToMainList(series: Series, notfiyRenderer = false): Promise<boolean> {
        const that = this;
        try {
            const results = await that.findSameSeriesInMainList(series);
            if (results.length != 0) {
                for (const entry of results) {
                    try {
                        series = await series.merge(entry);
                        await that.removeSeriesFromMainList(entry, notfiyRenderer);
                    } catch (err) {
                        console.log(err);
                    }
                }
            }

            ListController.mainList.push(series);

            if (notfiyRenderer) {
                await FrontendController.getInstance().updateClientList(await this.getIndexFromSeries(series), await this.getSeriesPackage(series));
            }

        } catch (err) {
            console.log(err);
            return false;
        }
        return true;
    }

    public getMainList(): Series[] {
        return ListController.mainList;
    }

    /**
     * Download the info from all providers.
     * @param anime 
     */
    public async forceRefreshProviderInfo(packageId: string) {
        const allSeriesInThePackage = ListController.mainList.filter(x => x.packageId === packageId);
        for (const series of allSeriesInThePackage) {
            const index = await this.getIndexFromSeries(series);
            if (index != -1) {
                try {
                    var result = await this.fillMissingProvider(ListController.mainList[index], true);
                    this.addSeriesToMainList(result);
                } catch (err) {
                    console.log(err);
                }
            }
        }
    }

    public async getIndexFromSeries(anime: Series): Promise<number> {
        return ListController.mainList.findIndex(x => anime.id === x.id);
    }

    public async getIndexFromPackageId(packageId: string): Promise<number> {
        return ListController.mainList.findIndex(x => packageId === x.id);
    }

    public async getSeriesListAndUpdateMainList(): Promise<void> {
        console.log('[calc] -> SeriesList');
        let allSeries: Series[] = await this.getAllEntrysFromProviders(true);

        await this.addSeriesToMainList(...allSeries);
    }


    public async getAllEntrysFromProviders(forceDownload: boolean = false): Promise<Series[]> {
        const anime: Series[] = [];
        for (const provider of ProviderList.listProviderList) {
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

    private async fillMissingProviders(entrys: Series[]): Promise<Series[]> {
        const filledEntry = [];
        for (let entry of entrys) {
            try {
                entry = await this.fillMissingProvider(entry);
                filledEntry.push(entry);
            } catch (err) {
                continue;
            }
        }
        await this.addSeriesToMainList(...filledEntry);
        return entrys;
    }

    private async fillMissingProvider(entry: Series, forceUpdate = false): Promise<Series> {
        if (new Date().getTime() - entry.lastInfoUpdate > new Date(0).setHours(72) || forceUpdate) {
            entry = await this.updateInfoProviderData(entry);
            try {
                entry = await this.fillListProvider(entry);
            } catch (err) {
                console.log(err);
            }
            entry.lastInfoUpdate = Date.now();
        }
        return entry;
    }

    private async fillListProvider(entry: Series, forceUpdate = false): Promise<Series> {
        entry = Object.assign(new Series(), entry);
        if (entry.getListProvidersInfos().length != ProviderList.listProviderList.length || forceUpdate) {
            for (const provider of ProviderList.listProviderList) {
                var result = undefined;
                try {
                    result = entry.getListProvidersInfos().find(x => x.provider === provider.providerName);
                } catch (err) { }
                if (result || forceUpdate) {
                    if (!forceUpdate) {
                        // Check if anime exist in main list and have already all providers in.
                        entry = await this.checkIfProviderExistInMainList(entry, provider);
                    }
                    try {
                        entry = await ProviderHelper.getProviderSeriesInfoByName(entry, provider);
                    } catch (err) {
                        console.log(err);
                    }
                    await timeHelper.delay(700);
                }
            }
        }
        return entry;
    }

    private async checkIfProviderExistInMainList(entry: Series, provider: ListProvider): Promise<Series> {
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

    private async updateInfoProviderData(series: Series, forceUpdate = false): Promise<Series> {
        for (const infoProvider of ProviderList.infoProviderList) {
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
