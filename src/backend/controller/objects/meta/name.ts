import listHelper from '../../../helpFunctions/list-helper';
import stringHelper from '../../../helpFunctions/string-helper';
import { NameType } from './name-type';
import SeasonNumberResponse from './response-object/season-number-response';
import { AbsoluteResult } from '../../../helpFunctions/comperators/comperator-results.ts/comperator-result';

export default class Name {

    public static getSearchAbleScore(name: Name, names: Name[] = []): number {
        const namesList = Object.freeze([...names]);
        let score = 0;
        if (name.lang.includes('en')) {
            score += 50;
        }
        if (name.lang.includes('x-jap')) {
            score += 25;
        }
        if (name.lang.includes('jap')) {
            score += 10;
        }

        const apperence = namesList.filter((item) => item.name === name.name).length;
        score = score ** apperence;

        if (name.nameType === NameType.OFFICIAL || name.nameType === NameType.MAIN) {
            score += 20;
        } else if (name.nameType === NameType.UNKNOWN) {
            score -= 10;
        } else if (name.nameType === NameType.SLUG) {
            score += 5;
        }
        score += (name.name.match(/\w/g) || []).length;
        return score;
    }

    public static async getRomajiName(names: Name[]): Promise<string> {
        let kanjiTitle = null;
        for (const name of names) {
            if (name.lang === 'x-jap' && name.nameType === NameType.MAIN) {
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

        throw new Error(names + 'HasNoRomajiName');
    }

    public static async getSeasonNumber(names: Name[]): Promise<SeasonNumberResponse> {
        const response = new SeasonNumberResponse();
        const seasonsDetected: SeasonNumberResponse[] = [];
        for (const name of names) {
            try {
                if (name && name.name) {
                    if (name.lang !== 'slug') {
                        if (name.nameType !== NameType.SLUG) {
                            const nr = await stringHelper.getSeasonNumberFromTitle(name.name);
                            if (nr.seasonNumber) {
                                if (nr.absoluteResult === AbsoluteResult.ABSOLUTE_TRUE) {
                                    return nr;
                                }
                                seasonsDetected.push(nr);
                            }
                        }
                    }
                }
            } catch (err) {
                continue;
            }
        }
        if (seasonsDetected.length === 0) {
            return response;
        }
        const mappedNumbers = seasonsDetected.map(x => x.seasonNumber);
        const onlyNumbers = mappedNumbers.filter(x => x) as number[];
        if (onlyNumbers) {
            const mostFrequentNumberInList = await listHelper.findMostFrequent(onlyNumbers);
            if (mostFrequentNumberInList) {
                const entrys = await listHelper.countEntrysInArray(mappedNumbers, mostFrequentNumberInList);
                // TODO if entrys have 10% 
                if (mappedNumbers.length / 10 <= entrys) {
                    response.seasonNumber = mostFrequentNumberInList;
                }
            }
        }
        return response;
    }
    public name: string = '';
    public lang: string = '';
    public nameType: NameType = NameType.UNKNOWN;

    constructor(name: string, lang: string, nameType: NameType = NameType.UNKNOWN) {
        this.name = name.trim();
        this.lang = lang;
        this.nameType = nameType;
    }
}
