import { NameType } from './name-type';
import stringHelper from '../../../helpFunctions/string-helper';
import listHelper from '../../../helpFunctions/list-helper';

export default class Name {
    name: string = '';
    lang: string = '';
    nameType: NameType = NameType.UNKNOWN;
    constructor(name: string, lang: string, nameType: NameType = NameType.UNKNOWN) {
        this.name = name;
        this.lang = lang;
        this.nameType = nameType;
    }

    public static async getRomajiName(names: Name[]): Promise<string> {
        let kanjiTitle = null;
        for (const name of names) {
            if (name.lang == 'x-jap' && name.nameType === NameType.MAIN) {
                return name.name;
            }
            if (!await stringHelper.hasKanji(name.name) && !await stringHelper.hasCyrillic(name.name)) {
                if (!await stringHelper.hasHangul(name.name)) {
                    kanjiTitle = name.name;
                }
            }
        }

        if (kanjiTitle) {
            return kanjiTitle;
        }

        throw names + 'HasNoRomajiName';
    }
    public static async getSeasonNumber(names: Name[]): Promise<number | undefined> {
        var seasonsDetected: number[] =  [];
        for (const name of names) {
            if (name && name.name) {
                if (name.lang !== "slug") {
                    if (name.nameType != NameType.SLUG) {
                        try {
                            var nr = await stringHelper.getSeasonNumberFromTitle(name.name);
                            if (nr > (seasonsDetected ? seasonsDetected : 0)) {
                                seasonsDetected.push(nr);
                            }
                        } catch (err) { }
                    }
                }
            }
        }
        if (seasonsDetected.length === 0) {
            return undefined;
        }
        return listHelper.findMostFrequent(seasonsDetected);
    }
}
