import FrontendController from './frontendController';
import Anime from './objects/anime';
import * as fs from "fs";
import * as path from "path";
import animeHelper from '../helpFunctions/animeHelper';
import Names from './objects/names';
import listHelper from '../helpFunctions/listHelper';
import titleCheckHelper from '../helpFunctions/titleCheckHelper';
import timeHelper from '../helpFunctions/timeHelper';
import sortHelper from '../helpFunctions/sortHelper';
import ProviderList from './providerList';
import WatchProgress  from './objects/watchProgress';
import { InfoProviderLocalData } from './objects/infoProviderLocalData';
export default class ListController {
    private static mainList: Anime[] = [];
    static listLoaded = false;
    constructor() {

        if (!ListController.listLoaded) {
            ListController.mainList = this.loadData();
            ListController.listLoaded = true;

            this.getSeriesList();


        }
    }

    private async syncWatcher() {
        var needToSync: Anime[] = [];
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

    public async syncProvider(anime: Anime) {

        const watchProgress = await anime.getLastWatchProgress();
        this.updateWatchProgressTo(anime, watchProgress.episode);

    }

    public async removeWatchProgress(anime: Anime, watchProgress: WatchProgress) {
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
    public async updateWatchProgressTo(anime: Anime, watchProgess: number) {
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

    public async addSeriesToMainList(...animes: Anime[]) {
        for (const anime of animes) {
            await this.addSerieToMainList(anime, (animes.length < 2))
        }
        if (animes.length > 2) {
            await this.cleanBadDataFromMainList();
            FrontendController.getInstance().sendSeriesList();
        }
        this.saveData(ListController.mainList);
    }

    private async findSameSeriesInMainList(entry2:Anime):Promise<Anime[]>{
        const foundedSameSeries = [];
        for (let entry of ListController.mainList) {
            if(entry.id != entry2.id){
                for (const providerInfos of entry.listProviderInfos) {
                    for (const providerInfos2 of entry2.listProviderInfos) {
                        if (providerInfos.id === providerInfos2.id && providerInfos.provider === providerInfos.provider) {
                            if (entry.seasonNumber === entry2.seasonNumber && entry.seasonNumber) {
                                foundedSameSeries.push(entry);
                            }
                        }
                    }
                }
            }
        }
        return foundedSameSeries;
    }

    public async removeSeriesFromMainList(anime:Anime): Promise<boolean>{
        const index = await this.getIndexFromAnime(anime);
        if(index != -1){
            ListController.mainList = await listHelper.removeEntrys(ListController.mainList,ListController.mainList[index]);
            return true;
        }
        return false;
    }

    public async addSerieToMainList(anime: Anime, notfiyRenderer = false): Promise<boolean> {
        try {
            const results = await this.findSameSeriesInMainList(anime);
            if(results.length != 0){
                for (const entry of results) {
                    try{
                    anime = await anime.merge(entry);
                    await this.removeSeriesFromMainList(entry);
                    }catch(err){
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

    public getMainList(): Anime[] {
        return ListController.mainList;
    }

    /**
     * Change the index and updates the client list on the frontend.
     * @param index 
     * @param anime 
     */
    private updateEntryInMainList(index: number, anime: Anime, sendToRenderer: boolean = true) {
        ListController.mainList[index] = anime;
        if (sendToRenderer) {
            FrontendController.getInstance().updateClientList(index, anime);
        }
    }

    /**
     * Download the info from all providers.
     * @param anime 
     */
    public async forceRefreshProviderInfo(anime: Anime) {
        const index = await this.getIndexFromAnime(anime);
        if (index != -1) {
            var result = await this.fillMissingProvider(ListController.mainList[index], true);
            this.addSeriesToMainList(result);
        }
    }
    public async getIndexFromAnime(anime: Anime): Promise<number> {
        return ListController.mainList.findIndex(x => anime.id === x.id);
    }

    public async cleanBadDataFromMainList(list:Anime[] = ListController.mainList):Promise<boolean> {
        try{
            var tempList = await this.combineDoubleEntrys(list);
            tempList = await this.sortList(tempList);
            console.log('Clean list');
            ListController.mainList = [];
            for (const entry of tempList) {
                await this.addSerieToMainList(entry, false);
            }
            console.log('[MainListSize] -> '+ListController.mainList.length)
            return true;
        }catch(err){
            console.log(err);
            return false;
        }
    }

    /**
     * Sorts a list.
     * 
     * Default list is the main list.
     * @param list 
     */
    private async sortList(list: Anime[] = ListController.mainList) {
        list = await sortHelper.quickSort(list, async (a: Anime, b: Anime) => {
            let aName: string = await Object.assign(new Names(), a.names).getRomajiName();
            let bName = await Object.assign(new Names(), b.names).getRomajiName();

            aName = aName.toLocaleLowerCase();
            bName = bName.toLocaleLowerCase();

            return aName.localeCompare(bName);
        });
        return list;
    }

    public async getSeriesList(): Promise<Anime[]> {
        console.log('[calc] -> SeriesList');
        let allSeries: Anime[] = await this.getAllEntrysFromProviders(true);

        await this.addSeriesToMainList(...allSeries);

        
        return ListController.mainList;
    }


    public async getAllEntrysFromProviders(forceDownload: boolean = false): Promise<Anime[]> {
        const anime: Anime[] = [];
        for (const provider of ProviderList.listProviderList) {
            try {
                if (await provider.isUserLoggedIn()) {
                    console.log('[Request] -> ' + provider.providerName + ' -> AllSeries');
                    const allSeries = await provider.getAllSeries(forceDownload);
                    for (const iterator of allSeries) {
                        anime.push(Object.assign(new Anime(),iterator));
                    }
                    console.log('[Request] -> result: ' + allSeries.length + ' items');

                }
            } catch (err) {
                console.log('[Error] -> ' + provider.providerName + ' -> AllSeries');
            }
        }
        return anime;
    }
    /**
     * Private functions for tests
     */
    public InternalTesting() {
        return {
            combineDoubleEntrys: this.combineDoubleEntrys,
            sameProvider: this.sameProvider,
            matchCalc: this.matchCalc,
            sortList: this.sortList
        }
    }

    private async fillMissingProviders(entrys: Anime[]): Promise<Anime[]> {
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

    private async fillMissingProvider(entry: Anime, forceUpdate = false): Promise<Anime> {
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

    private async updateInfoProviderData(anime: Anime): Promise<InfoProviderLocalData[]> {
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
     * This is a heavy comparer for series this checks if the season is the same the name release and episodes.
     * With this information it can merge them together and prevent double entrys in the list.
     * @param entrys 
     */
    private async combineDoubleEntrys(entrys: Anime[]): Promise<Anime[]> {
        var that = this;
        console.log('[calc] -> CombineEntrys');
        let dynamicEntrys = [...entrys];
        dynamicEntrys = dynamicEntrys.reverse();
        const newList: Anime[] = [];
        for (const a of entrys) {

            try {
                let bMatch: Anime | null = null;
                for (const b of dynamicEntrys) {
                    if (a !== b && !await that.sameProvider(a, b)) {
                        const matches: number = await that.matchCalc(a, b);

                        if (matches >= 3) {
                            bMatch = b;
                            break;
                        }
                    }
                }
                //
                // AddToFinalList
                //
                dynamicEntrys = await listHelper.removeEntrys(dynamicEntrys, a);
                if (bMatch != null) {
                    dynamicEntrys = await listHelper.removeEntrys(dynamicEntrys, bMatch);
                    entrys = await listHelper.removeEntrys(entrys, bMatch, a);

                    const aInit = Object.assign(new Anime(), a);
                    const mergedAnime = await aInit.merge(bMatch);

                    newList.push(mergedAnime);
                } else {
                    newList.push(a);
                }
            } catch (e) {

            }
        }

        return newList;
    }


    private async matchCalc(a: Anime, b: Anime): Promise<number> {
        let matches: number = 0;
        if (a.releaseYear === b.releaseYear && typeof a.releaseYear != 'undefined') {
            matches++;
        }
        const aSeason = await a.getSeason();
        if (aSeason != await b.getSeason() || typeof aSeason == 'undefined') {
            matches -= 2;
        }
        const allAEpisodes = await a.getAllEpisodes();
        const allBEpisodes = await b.getAllEpisodes();
        // Search if there is a match between the arrays.
        if (allAEpisodes.findIndex((valueA) => allBEpisodes.findIndex(valueB => valueB === valueA) != -1) != -1) {
            matches++;
        }
        if (matches == 0) {
            if (!await animeHelper.isSameSeason(a, b)) {
                return 0;
            }
        }
        if (await titleCheckHelper.checkAnimeNames(a, b)) {
            matches = matches + 2;
            if (await animeHelper.isSameSeason(a, b)) {
                matches++;
            }
        }
        return matches;
    }

    private async sameProvider(a: Anime, b: Anime): Promise<boolean> {
        for (const aProvider of a.listProviderInfos) {
            for (const bProvider of b.listProviderInfos) {
                if (aProvider.provider === bProvider.provider) {
                    return true;
                }
            }
        }
        return false;
    }

    private saveData(list: Anime[]) {
        console.log('Save list');
        console.log(this.getPath());
        fs.writeFileSync(this.getPath(), JSON.stringify(list));
    }

    private loadData(): Anime[] {
        try {
            if (fs.existsSync(this.getPath())) {
                const loadedString = fs.readFileSync(this.getPath(), 'UTF-8');
                const loadedData = JSON.parse(loadedString) as Anime[];
                for (let data of loadedData) {
                    data = Object.assign(new Anime(), data);
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
