import ProviderController from './providerController';
import electron from 'electron';
import Anime from './objects/anime';
import * as fs from "fs";
import * as path from "path";
import animeHelper from '../helpFunctions/animeHelper';
import Names from './objects/names';
import listHelper from '../helpFunctions/listHelper';
import titleCheckHelper from '../helpFunctions/titleCheckHelper';
export default class ListController {
    public async getSeriesList(): Promise<Anime[]> {
        console.log('[start] -> SeriesList');
        // var loadedData = this.loadData();
        let loadedData: Anime[] | null = null;
        if (loadedData == null || (loadedData as Anime[]).length === 0) {

            console.log('[calc] -> SeriesList');
            let allSeries: Anime[] = [];
            for (const provider of ProviderController.getInstance().list) {
                allSeries.push(...await provider.getAllSeries());
            }
            allSeries = await this.combineDoubleEntrys(allSeries);
            this.saveData(allSeries);

            allSeries = allSeries.sort((a, b) => {
                const aName = Object.assign(new Names(), a.names).getRomajiName(a.names).toLocaleLowerCase();
                const bName = Object.assign(new Names(), b.names).getRomajiName(b.names).toLocaleLowerCase();
                return aName.localeCompare(bName);
            })

            return allSeries;
        } else {
            console.log('[loaded] -> SeriesList');
            return loadedData;
        }
    }

    public InternalTesting() {
        return {
            combineDoubleEntrys: this.combineDoubleEntrys,
            sameProvider: this.sameProvider,
            matchCalc: this.matchCalc,
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
                console.log('[progress2] -> CombineEntrys = ' + dynamicEntrys.indexOf(b) + '/' + dynamicEntrys.length);
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
                const mergedAnime = aInit.merge(bMatch);

                newList.push(mergedAnime);
            } else {
                if (a.names.engName === '91 Days') {
                    console.log('Test');
                }
                newList.push(a);
            }
            console.log('[progress] -> CombineEntrys = ' + entrys.indexOf(a) + '/' + entrys.length);
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
        fs.writeFileSync(this.getPath(), JSON.stringify(list));
    }

    private loadData(): Anime[] {
        try {
            if (fs.existsSync(this.getPath())) {
                const loadedString = fs.readFileSync(this.getPath(), 'UTF-8');
                const loadedData = JSON.parse(loadedString) as Anime[];
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
