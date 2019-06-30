import ProviderController from './providerController';
import electron from 'electron';
import Anime from './objects/anime';
import * as fs from "fs";
import * as path from "path";
import resolve from 'resolve';
import animeHelper from '../helpFunctions/animeHelper';
import Names from './objects/names';
import listHelper from '../helpFunctions/listHelper';
import titleCheckHelper from '../helpFunctions/titleCheckHelper';
import timeHelper from '../helpFunctions/timeHelper';
import sortHelper from '../helpFunctions/sortHelper';
export default class ListController {
    private static mainList: Anime[] = [];
    static listLoaded = false;
    constructor() {
        if (!ListController.listLoaded) {
            ListController.mainList = this.loadData();
            ListController.listLoaded = true;
        }
    }

    public async addSeriesToMainList(...animes: Anime[]) {
        for (let anime of animes) {
            try {
                for (let entry of ListController.mainList) {
                    for (const providerInfos of entry.providerInfos) {
                        for (const providerInfos2 of anime.providerInfos) {
                            if (providerInfos.id === providerInfos2.id && providerInfos.provider === providerInfos.provider) {
                                if ((typeof entry.seasonNumber != 'undefined' && typeof anime.seasonNumber != 'undefined') || (typeof entry.seasonNumber === 'undefined' && typeof anime.seasonNumber === 'undefined')) {
                                    if (entry.seasonNumber === anime.seasonNumber) {
                                        const index = await this.getIndexFromAnime(entry);
                                        entry = Object.assign(new Anime(), entry);
                                        entry.readdFunctions();
                                        entry = await entry.merge(anime);
                                        this.updateEntryInMainList(index, entry);
                                        this.saveData(ListController.mainList);
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
                try {
                    anime = await this.fillMissingProvider(anime);
                } catch (err) {

                }

                ListController.mainList.push(anime);
                await ProviderController.getInstance().updateClientList(await this.getIndexFromAnime(anime), anime);

                await this.cleanBadDataFromMainList();

                this.saveData(ListController.mainList);
            } catch (err) {
                console.log(err);
            }
        }
    }

    public getMainList(): Anime[] {
        return ListController.mainList;
    }

    /**
     * Change the index and updates the client list on the frontend.
     * @param index 
     * @param anime 
     */
    private updateEntryInMainList(index: number, anime: Anime) {
        ListController.mainList[index] = anime;
        ProviderController.getInstance().updateClientList(index, anime);
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
        ListController.mainList = await this.combineDoubleEntrys(ListController.mainList);
        ListController.mainList = await this.sortList();
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
        let allSeries: Anime[] = await this.getAllEntrysFromProviders();

        await this.addSeriesToMainList(...allSeries);

        allSeries.push(...await this.fillMissingProviders(allSeries));

        await this.addSeriesToMainList(...allSeries);

        return ListController.mainList;
    }


    public async getAllEntrysFromProviders(): Promise<Anime[]> {
        const anime: Anime[] = [];
        for (const provider of ProviderController.getInstance().list) {
            try {
                console.log('[Request] -> ' + provider.providerName + ' -> AllSeries');
                anime.push(...await provider.getAllSeries());
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
        for (let entry of entrys) {
            try {
                entry = await this.fillMissingProvider(entry);
            } catch (err) {
                continue;
            }
        }
        return entrys;
    }

    private async fillMissingProvider(entry: Anime, forceUpdate = false): Promise<Anime> {
        let updatedInfo = false;
        if (entry.providerInfos.length != ProviderController.getInstance().list.length) {
            for (const provider of ProviderController.getInstance().list) {
                var result = entry.providerInfos.find(x => x.provider === provider.providerName);
                if (typeof result === 'undefined' || forceUpdate) {
                    try {

                        entry = await provider.getMoreSeriesInfo(entry);
                        updatedInfo = true;
                    } catch (err) {
                        console.log(err);
                    }
                    await timeHelper.delay(750);
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
            //AddToFinalList
            //
            dynamicEntrys = await listHelper.removeEntrys(dynamicEntrys, a);
            if (bMatch != null) {
                if (bMatch.names.engName === '91 Days') {
                    console.log('Test');
                }
                dynamicEntrys = await listHelper.removeEntrys(dynamicEntrys, bMatch);
                entrys = await listHelper.removeEntrys(entrys, bMatch, a);

                const aInit = Object.assign(new Anime(), a);
                const mergedAnime = await aInit.merge(bMatch);

                newList.push(mergedAnime);
            } else {
                if (a.names.engName === '91 Days') {
                    console.log('Test');
                }
                newList.push(a);
            }
        }
        return newList;
    }


    private async matchCalc(a: Anime, b: Anime): Promise<number> {
        let matches: number = 0;
        if (a.releaseYear === b.releaseYear && typeof a.releaseYear != 'undefined') {
            matches++;
        }
        if (a.seasonNumber === 0 || b.seasonNumber === 0 && a.seasonNumber != b.seasonNumber) {
            matches--;
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
        const userDataPath = (electron.app || electron.remote.app).getPath('userData');
        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        return path.join(userDataPath, 'list.json');
    }
}
