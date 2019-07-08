import ProviderController from './providerController';
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
            if (item.canSync) {
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
        for (const provider of anime.providerInfos) {
            try {
                const watchProgress = await anime.getLastWatchProgress();
                const newProvider = await provider.getProviderInstance().updateEntry(anime, watchProgress)

                var index = anime.providerInfos.findIndex(x => x.provider === provider.provider);
                anime.providerInfos[index] = newProvider;
                this.addSeriesToMainList(anime);

            } catch (err) {

            }
        }
    }

    public async addSeriesToMainList(...animes: Anime[]) {
        for (const anime of animes) {
            this.addSerieToMainList(anime, (animes.length < 2))
        }
        if (animes.length > 2) {
            await this.cleanBadDataFromMainList();
            ProviderController.getInstance().sendSeriesList();
        }
        this.saveData(ListController.mainList);
    }

    public async addSerieToMainList(anime: Anime, notfiyRenderer = false): Promise<boolean> {
        try {
            for (let entry of ListController.mainList) {
                for (const providerInfos of entry.providerInfos) {
                    for (const providerInfos2 of anime.providerInfos) {
                        if (providerInfos.id === providerInfos2.id && providerInfos.provider === providerInfos.provider) {
                            if (entry.seasonNumber === anime.seasonNumber) {
                                const index = await this.getIndexFromAnime(entry);
                                entry = Object.assign(new Anime(), entry);
                                entry.readdFunctions();
                                entry = await entry.merge(anime);
                                this.updateEntryInMainList(index, entry, notfiyRenderer);
                                return true;
                            }
                        }
                    }
                }
            }

            ListController.mainList.push(anime);

            if (notfiyRenderer) {
                await ProviderController.getInstance().updateClientList(await this.getIndexFromAnime(anime), anime);
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
            ProviderController.getInstance().updateClientList(index, anime);
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

    public async cleanBadDataFromMainList() {
        var tempList = await this.combineDoubleEntrys(ListController.mainList);
        tempList = await this.sortList(tempList);
        ListController.mainList = [];
        for (const entry of tempList) {
            this.addSerieToMainList(entry, false);
        }
        await ProviderController.getInstance().sendSeriesList();
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

        await this.fillMissingProviders(this.getMainList());

        return ListController.mainList;
    }


    public async getAllEntrysFromProviders(forceDownload: boolean = false): Promise<Anime[]> {
        const anime: Anime[] = [];
        for (const provider of ProviderList.list) {
            try {
                if (provider.isUserLoggedIn()) {
                    console.log('[Request] -> ' + provider.providerName + ' -> AllSeries');
                    anime.push(...await provider.getAllSeries(forceDownload));
                }
            } catch (err) {
                console.log('[Error] -> ' + provider.providerName + ' -> AllSeries');
            }
        }
        return anime;
    }

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
        if (entry.providerInfos.length != ProviderList.list.length || forceUpdate) {
            for (const provider of ProviderList.list) {
                var result = entry.providerInfos.find(x => x.provider === provider.providerName);
                if (typeof result === 'undefined' || forceUpdate) {
                    if (!forceUpdate) {
                        // Check if anime exist in main list and have already all providers in.
                        var validProvider = entry.providerInfos.find(x => (typeof x.id != 'undefined' && x.id != null));
                        if (typeof validProvider != 'undefined') {
                            for (const anime of this.getMainList()) {
                                for (const oldprovider of anime.providerInfos) {
                                    if (oldprovider.provider == validProvider.provider && oldprovider.id == validProvider.id) {
                                        if (oldprovider.lastUpdate < validProvider.lastUpdate || typeof oldprovider.lastUpdate == 'undefined') {
                                            var providerInfos = await listHelper.removeEntrys(entry.providerInfos, oldprovider);
                                            providerInfos.push(validProvider);
                                            entry.providerInfos = providerInfos;
                                        }
                                        var findSearchedProvider = anime.providerInfos.find(x => x.provider === provider.providerName);
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
                        const matches = await that.matchCalc(a, b);

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

        if (a.seasonNumber != b.seasonNumber) {
            matches -= 2;
        }

        if (a.episodes === b.episodes) {
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
        for (const aProvider of a.providerInfos) {
            for (const bProvider of b.providerInfos) {
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
