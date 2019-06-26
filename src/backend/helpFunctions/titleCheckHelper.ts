import Anime from '../controller/objects/anime';
import Names from '../controller/objects/names';
import stringHelper from './stringHelper';

export default new class TitleCheckHelper {
    public async checkAnimeNames(a: Anime, b: Anime): Promise<boolean> {
        let aNameList: string[] = [...await Object.assign(new Names(), a.names).getAllNames()];
        let bNameList: string[] = [...await Object.assign(new Names(), b.names).getAllNames()];

        if (await this.fastMatch(aNameList, bNameList)) {
            for (let name of aNameList) {
                try {
                    name = stringHelper.cleanString(name);
                    aNameList.push(await this.removeSeasonMarkesFromTitle(name));
                } catch (err) { }
            }
            for (let name of bNameList) {
                try {
                    name = stringHelper.cleanString(name);
                    bNameList.push(await this.removeSeasonMarkesFromTitle(name));
                } catch (err) { }
            }
            if (await this.checkAnimeNamesInArray(aNameList, bNameList)) {
                return true;
            }
        }
        return false;
    }

    public async checkAnimeNamesInArray(a: string[], b: string[]): Promise<boolean> {
        for (const aName of a) {
            if (aName != null && aName !== '') {
                for (const bName of b) {
                    if (bName != null && aName !== '') {
                        if (aName.toLocaleLowerCase() === bName.toLocaleLowerCase()) {
                            return true;
                        }
                        if (aName.replace(/Season\s{1,}(\d{1,})/gmi, '').trim() === bName.replace(/Season\s{1,}(\d{1,})/gmi, '').trim()) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    public async fastMatch(aList: string[], bList: string[]): Promise<boolean> {
        var al = [...aList];
        var bl = [...bList];
        for (let a of al) {
            for (let b of bl) {

                var shortestTextLength = 0;
                if (a.length < b.length) {
                    shortestTextLength = a.length;
                } else {
                    shortestTextLength = b.length;
                }
                var shortScan = Math.ceil(shortestTextLength / 4);
                if (shortScan < 3) {
                    shortScan = Math.ceil(shortestTextLength / 1.5)
                }
                var aResult = a.substring(0, shortScan).toLocaleLowerCase();
                var bResult = b.substring(0, shortScan).toLocaleLowerCase();

                if (aResult === bResult) {
                    return true;
                }
            }
        }
        return false;
    }

    public async removeSeasonMarkesFromTitle(title: string): Promise<string> {
        if (title != null && title !== '') {
            var reversedTitle = await stringHelper.reverseString(title);
            var lastChar = reversedTitle.charAt(0);
            var countLastChar = 0;
            if ('0123456789'.includes(lastChar)) {
                return (await stringHelper.reverseString(reversedTitle.substr(1))).trim();
            } else {
                while (lastChar === reversedTitle.charAt(0)) {
                    countLastChar++;
                    reversedTitle = reversedTitle.substr(1);
                }

                if (countLastChar != 1) {
                    return (await stringHelper.reverseString(reversedTitle)).trim();
                }
            }
        }
        throw 'NoName';
    }
}