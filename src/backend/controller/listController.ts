import ProviderController from './providerController';
import electron = require('electron');
import path = require('path');
import fs = require('fs');
import Anime from './objects/anime';

export class ListController {
    public async getSeriesList(): Promise<Anime[]> {
        // var loadedData = this.loadData();
        const loadedData: Anime[] | null = null;
        if (loadedData == null || loadedData.length === 0) {


            let allSeries: Anime[] = [];
            for (const provider of ProviderController.getInstance().list) {
                allSeries.push(...await provider.getAllSeries());
            }
            allSeries = await this.combineDoubleEntrys(allSeries);
            this.saveData(allSeries);
            return allSeries;
        } else {
            return loadedData;
        }
    }

    private async combineDoubleEntrys(entrys: Anime[]): Promise<Anime[]> {
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
        aNameList = this.cleanArray(aNameList);
        bNameList = this.cleanArray(bNameList);
        for (const aName of aNameList) {
            if (aName != null && aName !== '') {
                for (const bName of bNameList) {
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

    private cleanArray(actual: string[]): string[] {
        const newArray: string[] = [];
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < actual.length; i++) {
            if (actual[i]) {
                newArray.push(actual[i]);
            }
        }
        return newArray;
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
    }

    private getPath(): string {
        const userDataPath = (electron.app || electron.remote.app).getPath('userData');
        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        return path.join(userDataPath, 'list.json');
    }
}
