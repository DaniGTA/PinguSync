import listHelper from '../../../backend/helpFunctions/listHelper';
import stringHelper from '../../../backend/helpFunctions/stringHelper';
import Name from './name';

export default class Names {
    mainName: string = '';
    romajiName: string = '';
    engName: string = '';
    shortName: string = '';
    otherNames: Name[] = [];

    public async getRomajiName(names: Names = this): Promise<string> {
        if (names.mainName == null || names.mainName === '' || await this.hasKanji(names.mainName)) {
            if (names.engName != null && names.engName !== '') {
                return names.engName;
            } else if (names.romajiName != null && names.romajiName !== '') {
                return names.romajiName;
            } else if (names.shortName != null && names.shortName !== '') {
                return names.shortName;
            }
            for (const otherName of names.otherNames) {
                if (otherName != null && otherName.name !== '') {
                    if (!await this.hasKanji(otherName.name)) {
                        return otherName.name;
                    }
                }
            }
        } else {
            if (names.mainName != null && names.mainName !== '') {
                return names.mainName;
            }
        }
        console.log('[search] -> Names -> getRomaji -> ' + names.mainName + ' -> noResults');
        throw names.mainName + 'HasNoRomajiName';
    }
    public async getSeasonNumber(): Promise<number | undefined> {
        var highestSeasonDetected: number | undefined;
        for (const name of await this.getAllNames()) {
            try {
                var nr = await this.getSeasonNumberFromTitle(name);
                if (nr > (highestSeasonDetected ? highestSeasonDetected : 0)) {
                    highestSeasonDetected = nr;
                }
            } catch (err) { }
        }
        return highestSeasonDetected;
    }

    /**
     * This will search in name providers for more names
     */
    public async fillNames() {
        //for (const provider of new NameProviderController().getAllNameProviders()) {

        //}
    }

    public async getAllNames(): Promise<string[]> {
        var allNames = [this.engName, this.mainName, this.romajiName, this.shortName];
        if (this.otherNames != null && this.otherNames.length !== 0) {
            allNames.push(...this.otherNames.flatMap(x => x.name));
        }
        return await listHelper.cleanArray(allNames);
    }

    private async getSeasonNumberFromTitle(title: string): Promise<number> {
        var reversedTitle = await stringHelper.reverseString(title);
        var lastChar = reversedTitle.charAt(0);
        var countLastChar = 0;
        if (title.toLocaleLowerCase().includes('episode')) {
            throw 'That name dont have a Season';
        }
        if (title.match(/Season\s{1,}(\d{1,})|(\d{1,})nd/gmi)) {
            var match = /Season\s{1,}(\d{1,})|(\d{1,})nd/gmi.exec(title);
            if (match != null) {
                if (typeof match[1] !== 'undefined') {
                    return parseInt(match[1]);
                } else if (typeof match[2] !== 'undefined') {
                    return parseInt(match[2]);
                }
            }
        } else if ('0123456789'.includes(lastChar)) {
            return parseInt(lastChar, 10);
        } else if (['I'].includes(lastChar)) {
            while (lastChar === reversedTitle.charAt(0)) {
                countLastChar++;
                reversedTitle = reversedTitle.substr(1);
            }
        }
        if (countLastChar != 1) {
            return countLastChar;
        } else {
            throw 'That name dont have a Season';
        }
    }

    private async hasKanji(s: string): Promise<boolean> {
        return s.match('[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]{1,}') != null;
    }

    public InternalTesting() {
        return {
            hasKanji: this.hasKanji,
            getSeasonNumberFromTitle: this.getSeasonNumberFromTitle,
        }
    }

}
