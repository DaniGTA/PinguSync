import FrontendController from './frontendController';
import Series from './objects/series';
import * as fs from "fs";
import * as path from "path";
import animeHelper from '../helpFunctions/animeHelper';
import Names from './objects/names';
import listHelper from '../helpFunctions/listHelper';
import titleCheckHelper from '../helpFunctions/titleCheckHelper';
import timeHelper from '../helpFunctions/timeHelper';
import sortHelper from '../helpFunctions/sortHelper';
import ProviderList from './providerList';
import WatchProgress from './objects/watchProgress';
import { InfoProviderLocalData } from './objects/infoProviderLocalData';
export default class ListController {
    private static mainList: Series[] = [];
    static listLoaded = false;
    constructor() {

        if (!ListController.listLoaded) {
            ListController.mainList = this.loadData();
            ListController.listLoaded = true;

            this.getSeriesListAndUpdateMainList();


        }
    }

    private async syncWatcher() {
        var needToSync: Series[] = [];
        for (const item of ListController.mainList) {
            if (await item.getCanSyncStatus()) {
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
        for (const provider of anime.listProviderInfos) {
            try {
                const providerInstance = await provider.getListProviderInstance();
                if (await providerInstance.isUserLoggedIn()) {
                    const newProvider = await providerInstance.removeEntry(anime, watchProgress);
                    newProvider.lastUpdate = new Date(Date.now());
                    var index = anime.listProviderInfos.findIndex(x => x.provider === provider.provider);
                    anime.listProviderInfos[index] = newProvider;
                }
            } catch (err) {

            }
        }
    }
    public async updateWatchProgressTo(anime: Series, watchProgess: number) {
        if (anime.listProviderInfos.length < ProviderList.listProviderList.length / 2) {
            await this.fillMissingProvider(anime);
        }
        for (const provider of anime.listProviderInfos) {
            try {
                const providerInstance = await provider.getListProviderInstance();
                if (await providerInstance.isUserLoggedIn()) {
                    const newProvider = await providerInstance.updateEntry(anime, new WatchProgress(watchProgess))
                    newProvider.lastUpdate = new Date(Date.now());
                    var index = anime.listProviderInfos.findIndex(x => x.provider === provider.provider);
                    anime.listProviderInfos[index] = newProvider;
                }
            } catch (err) {
                console.log(err);
            }
        }
        await this.addSeriesToMainList(anime);
    }

    public async addSeriesToMainList(...animes: Series[]) {
        console.log('Add ' + animes.length + ' to mainList');
        for (const anime of animes) {
            await this.addSerieToMainList(anime, (animes.length < 2))
        }
        console.log('Added ' + ListController.mainList.length + ' to mainList');
        if (animes.length > 2) {
            await this.cleanBadDataFromMainList();
            FrontendController.getInstance().sendSeriesList();
        }
        this.saveData(ListController.mainList);
    }

    private async findSameSeriesInMainList(entry2: Series): Promise<Series[]> {
        const foundedSameSeries = [];
        for (let entry of ListController.mainList) {
            if (entry.id === entry2.id) {
                foundedSameSeries.push(entry);
            } else {
                if (await this.matchCalc(entry, entry2)) {
                    foundedSameSeries.push(entry);
                }

            }
        }
        return foundedSameSeries;
    }

    public async removeSeriesFromMainList(anime: Series, notifyRenderer = false): Promise<boolean> {
        const index = await this.getIndexFromAnime(anime);
        if (index != -1) {
            ListController.mainList = await listHelper.removeEntrys(ListController.mainList, ListController.mainList[index]);
            if (notifyRenderer) {
                FrontendController.getInstance().removeEntryFromList(index);
            }
            return true;
        }
        return false;
    }

    public async addSerieToMainList(anime: Series, notfiyRenderer = false): Promise<boolean> {
        try {
            const results = await this.findSameSeriesInMainList(anime);
            if (results.length != 0) {
                for (const entry of results) {
                    try {
                        anime = await anime.merge(entry);
                        await this.removeSeriesFromMainList(entry, notfiyRenderer);
                    } catch (err) {
                        console.log(err);
                    }
                }
            }

            ListController.mainList.push(anime);

            if (notfiyRenderer) {
                await FrontendController.getInstance().updateClientList(await this.getIndexFromAnime(anime), anime);
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
     * Change the index and updates the client list on the frontend.
     * @param index 
     * @param anime 
     */
    private updateEntryInMainList(index: number, anime: Series, sendToRenderer: boolean = true) {
        ListController.mainList[index] = anime;
        if (sendToRenderer) {
            FrontendController.getInstance().updateClientList(index, anime);
        }
    }

    /**
     * Download the info from all providers.
     * @param anime 
     */
    public async forceRefreshProviderInfo(anime: Series) {
        const index = await this.getIndexFromAnime(anime);
        if (index != -1) {
            var result = await this.fillMissingProvider(ListController.mainList[index], true);
            this.addSeriesToMainList(result);
        }
    }
    public async getIndexFromAnime(anime: Series): Promise<number> {
        return ListController.mainList.findIndex(x => anime.id === x.id);
    }

    public async cleanBadDataFromMainList(list: Series[] = ListController.mainList): Promise<boolean> {
        try {
            for (const entry of list) {
                await this.addSerieToMainList(entry, false);
            }
            console.log('[MainListSize] -> ' + ListController.mainList.length)
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
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
        let updatedInfo = false;
        let days = - 1000 * 60 * 60 * 24 * (Math.floor(Math.random() * 6) + 2);
        if (typeof entry.lastUpdate != 'undefined' && entry.lastUpdate + days < Date.now() && !forceUpdate) {
            return entry;
        }
        const results = await this.updateInfoProviderData(entry);
        for (const infoProviderResult of results) {
            const searchResult = entry.infoProviderInfos.findIndex(entry => entry.provider === infoProviderResult.provider);
            if (searchResult != -1) {
                entry.infoProviderInfos[searchResult] = infoProviderResult;
            } else {
                entry.infoProviderInfos.push(infoProviderResult);
            }
        }

        if (entry.listProviderInfos.length != ProviderList.listProviderList.length || forceUpdate) {
            for (const provider of ProviderList.listProviderList) {
                var result = entry.listProviderInfos.find(x => x.provider === provider.providerName);
                if (typeof result === 'undefined' || forceUpdate) {
                    if (!forceUpdate) {
                        // Check if anime exist in main list and have already all providers in.
                        var validProvider = entry.listProviderInfos.find(x => (typeof x.id != 'undefined' && x.id != null));
                        if (typeof validProvider != 'undefined') {
                            for (const anime of this.getMainList()) {
                                for (const oldprovider of anime.listProviderInfos) {
                                    if (oldprovider.provider == validProvider.provider && oldprovider.id == validProvider.id) {
                                        if (oldprovider.lastUpdate < validProvider.lastUpdate || typeof oldprovider.lastUpdate == 'undefined') {
                                            var providerInfos = await listHelper.removeEntrys(entry.listProviderInfos, oldprovider);
                                            providerInfos.push(validProvider);
                                            entry.listProviderInfos = providerInfos;
                                        }
                                        var findSearchedProvider = anime.listProviderInfos.find(x => x.provider === provider.providerName);
                                        if (typeof findSearchedProvider != 'undefined') {
                                            if (new Date(findSearchedProvider.lastUpdate).getMilliseconds() < new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).getMilliseconds()) {
                                                break;
                                            }
                                        } else {
                                            break;
                                        }
                                    }
                                }
                            }
                        }

                    }
                    try {
                        entry = await provider.getMoreSeriesInfo(entry);
                        updatedInfo = true;
                    } catch (err) {
                        console.log(err);
                    }
                    await timeHelper.delay(700);
                }
            }

        }
        if (updatedInfo) {
            return entry;
        } else {
            throw 'No info updated';
        }

    }

    private async updateInfoProviderData(anime: Series): Promise<InfoProviderLocalData[]> {
        const result: InfoProviderLocalData[] = [];
        for (const infoProvider of ProviderList.infoProviderList) {
            try {
                const index = anime.infoProviderInfos.findIndex(entry => infoProvider.providerName == infoProvider.providerName);
                if (index != -1) {
                    const provider = anime.infoProviderInfos[index];
                    if (new Date().getTime() - provider.lastUpdate.getTime() < new Date(0).setHours(72)) {
                        const data = await infoProvider.getSeriesInfo(anime);
                        result.push(data);
                    }
                } else {
                    const data = await infoProvider.getSeriesInfo(anime);
                    result.push(data);
                }
            } catch (err) {
                console.log(err);
            }
        }
        return result;
    }

    /**
     * Calculate the value
     * @param a 
     * @param b 
     */
    private async matchCalc(a: Series, b: Series): Promise<boolean> {
        let matches: number = 0;
        let matchAbleScore: number = 0;
        a = Object.assign(new Series(), a);
        b = Object.assign(new Series(), b);
        // Check releaseYear
        if (a.releaseYear && b.releaseYear) {
            matchAbleScore++;
            if (a.releaseYear === b.releaseYear) {
                matches++;
            }
        }

        // Check season
        const aSeason = await a.getSeason();
        const bSeason = await b.getSeason();
        if (aSeason || bSeason) {
            matchAbleScore += 3;
            if (aSeason === bSeason) {
                matches += 3;
            } else if (!aSeason && bSeason === 1) {
                matches += 1;
            } else if (!bSeason && aSeason === 1) {
                matches += 1;
            }
        }
        if (a.listProviderInfos.length != 0 && b.listProviderInfos.length != 0) {
            matchAbleScore += 2;
            if (await this.checkProviderId(a, b)) {
                matches += 2;
            }
        }


        const allAEpisodes = await a.getAllEpisodes();
        const allBEpisodes = await b.getAllEpisodes();
        // Search if there is a match between the arrays.
        if (allAEpisodes.length != 0 && allBEpisodes.length != 0) {
            matchAbleScore++;
            if (allAEpisodes.findIndex((valueA) => allBEpisodes.findIndex(valueB => valueB === valueA) != -1) != -1) {
                matches++;
            }
        }
        matchAbleScore += 2;
        if (await titleCheckHelper.checkAnimeNames(a, b)) {
            matches += 2;
        }
        return matches >= matchAbleScore / 1.45;
    }
    private async checkProviderId(a: Series, b: Series): Promise<boolean> {
        for (const aProvider of a.listProviderInfos) {
            for (const bProvider of b.listProviderInfos) {
                if (aProvider.provider === bProvider.provider && aProvider.id === bProvider.id) {
                    if (aProvider.targetSeason === bProvider.targetSeason) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    private async sameProvider(a: Series, b: Series): Promise<boolean> {
        for (const aProvider of a.listProviderInfos) {
            for (const bProvider of b.listProviderInfos) {
                if (aProvider.provider === bProvider.provider) {
                    return true;
                }
            }
        }
        return false;
    }

    private saveData(list: Series[]) {
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
