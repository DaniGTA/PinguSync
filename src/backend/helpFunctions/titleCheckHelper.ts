import Series from '../controller/objects/series';
import stringHelper from './stringHelper';

export default new class TitleCheckHelper {
    public async checkSeriesNames(a: Series, b: Series): Promise<boolean> {
        let aNameList: string[] =  a.getAllNames().flatMap(x=> x.name);
        let bNameList: string[] = b.getAllNames().flatMap(x=> x.name);
        return await this.checkNames(aNameList, bNameList);
    }

    public async checkNames(aNameList: string[], bNameList: string[]) {
        if (await this.fastMatch(aNameList, bNameList)) {
            for (let name of aNameList) {
                try {
                    name = await stringHelper.cleanString(name);
                    var name2 = await this.removeSeasonMarkesFromTitle(name);
                    if (name2 != name) {
                        aNameList.push(name2);
                    }
                } catch (err) {
                    continue;
                }
            }
            for (let name of bNameList) {
                try {
                    name = await stringHelper.cleanString(name);
                    var name2 = await this.removeSeasonMarkesFromTitle(name);
                    if (name2 != name) {
                        bNameList.push(name2);
                    }
                } catch (err) {
                    continue;
                }
            }
            if (await this.checkAnimeNamesInArray(aNameList, bNameList)) {
                return true;
            }
        }
        return false;
    }

    public async checkAnimeNamesInArray(a: string[], b: string[]): Promise<boolean> {
        for (let aName of [...a]) {
            if (aName != null && aName !== '') {
                for (let bName of [...b]) {

                    if (bName != null && aName !== '') {
                        aName = aName.toLocaleLowerCase().trim();
                        bName = bName.toLocaleLowerCase().trim();
                        if (aName === bName) {
                            return true;
                        }
                        aName = await stringHelper.cleanString(aName)
                        bName = await stringHelper.cleanString(bName)
                        if (aName === bName) {
                            return true;
                        }
                        aName = aName.replace(/Season\s{1,}(\d{1,})/gmi, '').trim()
                        bName = bName.replace(/Season\s{1,}(\d{1,})/gmi, '').trim()
                        if (aName === bName) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    public async fastMatch(aList: string[], bList: string[]): Promise<boolean> {
        try {
            var al = [...aList];
            var bl = [...bList];
            for (let a of al) {
                if(a){
                    for (let b of bl) {
                        if(b){
                            var shortestTextLength = 0;
                            if (a.length < b.length) {
                                shortestTextLength = a.length;
                            } else {
                                shortestTextLength = b.length;
                            }
                            var shortScan = Math.ceil(shortestTextLength / 4);
                            if (shortScan < 3) {
                                shortScan = Math.ceil(shortestTextLength / 1.25)
                            }
                            var aResult = a.substring(0, shortScan).toLocaleLowerCase();
                            var bResult = b.substring(0, shortScan).toLocaleLowerCase();

                            if (aResult === bResult) {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    public async removeSeasonMarkesFromTitle(title: string): Promise<string> {
        if (title != null && title !== '') {
            var reversedTitle = await stringHelper.reverseString(title);
            var lastChar = reversedTitle.charAt(0);
            var countLastChar = 0;
            if (title.match(/Season\s{1,}(\d{1,})|(\d{1,})nd/gmi)) {
                var match = /Season\s{1,}(\d{1,})|(\d{1,})nd/gmi.exec(title);
                if (match != null) {
                    return title.replace(match[0], "").replace('  ', ' ').trim();
                }
            } else if (title.toLocaleLowerCase().includes('episode')) {
                return title;
            }
            if ('0123456789'.includes(lastChar)) {
                return (await stringHelper.reverseString(reversedTitle.substr(1))).trim();
            } else {
                while (lastChar === reversedTitle.charAt(0)) {
                    countLastChar++;
                    reversedTitle = reversedTitle.substr(1);
                }

                if (countLastChar != 1) {
                    return (await stringHelper.reverseString(reversedTitle)).replace('  ', ' ').trim();
                }
            }
        }
        throw 'NoName';
    }
}
