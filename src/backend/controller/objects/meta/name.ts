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

    public static getSearchAbleScore(name: Name, names: Name[] = []): number {
        const namesList = Object.freeze([...names]);
        let score = 0;
        if (name.lang.includes("en")) {
            score += 50;
        }
        if (name.lang.includes("x-jap")) {
            score += 25;
        }
        if (name.lang.includes("jap")) {
            score += 10;
        }

        var apperence = namesList.filter(function(item){ return item.name === name.name; }).length
        score = score ** apperence;

        if (name.nameType === NameType.OFFICIAL || name.nameType === NameType.MAIN) {
            score += 20;
        } else if (name.nameType === NameType.UNKNOWN) {
            score -= 10;
        } else if (name.nameType == NameType.SLUG) {
            score += 5;
        }
        score += (name.name.match(/\w/g) || []).length;
        return score;
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
        var seasonsDetected: number[] = [];
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
