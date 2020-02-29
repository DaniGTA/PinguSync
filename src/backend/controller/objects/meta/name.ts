import { AbsoluteResult } from '../../../helpFunctions/comperators/comperator-results.ts/comperator-result';
import listHelper from '../../../helpFunctions/list-helper';
import StringHelper from '../../../helpFunctions/string-helper';
import { NameType } from './name-type';
import SeasonNumberResponse from './response-object/season-number-response';
import logger from '../../../logger/logger';

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
            if (!await StringHelper.hasKanji(name.name) && !await StringHelper.hasCyrillic(name.name)) {
                if (!await StringHelper.hasHangul(name.name)) {
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
        const seasonsDetected = await Name.getSeasonNumbersInNames(names);
        if (!Array.isArray(seasonsDetected)) {
            return seasonsDetected;
        }
        if (seasonsDetected.length === 0) {
            return response;
        }
        const mappedNumbers = seasonsDetected.map((x) => x.seasonNumber);
        const onlyNumbers = mappedNumbers.filter((x) => x) as number[];
        if (onlyNumbers) {
            const mostFrequentNumberInList = await listHelper.findMostFrequent(onlyNumbers);
            if (mostFrequentNumberInList) {
                const entrys = await listHelper.countEntrysInArray(mappedNumbers, mostFrequentNumberInList);
                if (names.length / 10 <= entrys) {
                    response.seasonNumber = mostFrequentNumberInList;
                }
            }
        }
        return response;
    }

    private static async getSeasonNumbersInNames(names: Name[]): Promise<SeasonNumberResponse[] | SeasonNumberResponse> {
        const seasonsDetected: SeasonNumberResponse[] = [];
        for (const nameObj of names) {
            try {
                if (Name.canGetValidSeasonNumberFromName(nameObj)) {
                    const nr = await StringHelper.getSeasonNumberFromTitle(nameObj.name);
                    if (nr.seasonNumber) {
                        if (nr.absoluteResult === AbsoluteResult.ABSOLUTE_TRUE) {
                            return nr;
                        }
                        seasonsDetected.push(nr);
                    }
                }
            } catch (err) {
                logger.debug(`[getSeasonNumbersInNames] Failed extracting season from name: ` + nameObj.name);
                logger.debug(err);
                continue;
            }
        }
        return seasonsDetected;
    }

    private static canGetValidSeasonNumberFromName(nameObj?: Name): boolean {
        if (nameObj?.name && nameObj.lang !== 'slug' && nameObj.nameType !== NameType.SLUG) {
            return true;
        }
        return false;
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
