import ProviderController from './providerController';
import electron from 'electron';
import Anime, { Names } from './objects/anime';
import * as fs from "fs";
import * as path from "path";
import StringHelper from '../helpFunctions/stringHelper';
import listHelper from '../helpFunctions/listHelper';
export class ListController {
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

    private async combineDoubleEntrys(entrys: Anime[]): Promise<Anime[]> {
        console.log('[calc] -> CombineEntrys');
        const dynamicEntrys = entrys;
        const newList: Anime[] = [];
        for (const a of entrys) {
            let bMatch: Anime | null = null;
            let matches: number = 0;
            for (const b of dynamicEntrys) {
                if (a !== b && !await this.sameProvider(a, b)) {
                    matches = 0;
                    if (a.releaseYear === b.releaseYear) {
                        matches++;
                    }

                    if (a.episodes === b.episodes) {
                        matches++;
                    }

                    if (await this.checkAnimeNames(a, b)) {
                        matches++;
                    }

                    if (matches >= 2) {
                        bMatch = b;
                        break;
                    }
                }
            }
            const index = dynamicEntrys.indexOf(a);
            if (index > -1) {
                dynamicEntrys.splice(index, 1);
            }
            if (bMatch != null) {
                const i = dynamicEntrys.indexOf(bMatch);
                if (i > -1) {
                    dynamicEntrys.splice(i, 1);
                }
                const aInit = Object.assign(new Anime(), a);
                const mergedAnime = aInit.merge(bMatch);
                newList.push(mergedAnime);

            } else {
                newList.push(a);
            }
        }
        return newList;
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

    private async checkAnimeNames(a: Anime, b: Anime): Promise<boolean> {
        let aNameList: string[] = [];
        let bNameList: string[] = [];
        aNameList.push(a.names.engName, a.names.mainName, a.names.romajiName, a.names.shortName, ...a.names.otherNames);
        bNameList.push(b.names.engName, b.names.mainName, b.names.romajiName, b.names.shortName, ...b.names.otherNames);
        aNameList = await listHelper.cleanArray(aNameList);
        bNameList = await listHelper.cleanArray(bNameList);
        for (const name of aNameList) {
            aNameList.push(await this.removeSeasonMarkesFromTitle(name));
        }
        for (const name of bNameList) {
            bNameList.push(await this.removeSeasonMarkesFromTitle(name));
        }
        if (await this.checkAnimeNamesInArray(aNameList, bNameList)) {
            return true;
        }


        return false;
    }

    private async checkAnimeNamesInArray(a: string[], b: string[]): Promise<boolean> {
        for (const aName of a) {
            if (aName != null && aName !== '') {
                for (const bName of b) {
                    if (bName != null && aName !== '') {
                        if (aName.toLocaleLowerCase() === bName.toLocaleLowerCase()) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    private async removeSeasonMarkesFromTitle(title: string): Promise<string> {

        var reversedTitle = await StringHelper.reverseString(title);
        var lastChar = reversedTitle.charAt(0);
        var countLastChar = 0;
        while (lastChar === reversedTitle.charAt(countLastChar)) {
            countLastChar++;
            reversedTitle = reversedTitle.substr(1);
        }
        return (await StringHelper.reverseString(reversedTitle)).trim();
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
