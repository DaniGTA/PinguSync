import { AbsoluteResult } from '../../../helpFunctions/comperators/comperator-results.ts/comperator-result';
import listHelper from '../../../helpFunctions/list-helper';
import StringHelper from '../../../helpFunctions/string-helper';
import logger from '../../../logger/logger';
import { NameType } from './name-type';
import SeasonNumberResponse from './response-object/season-number-response';
import TitleHelper from '../../../helpFunctions/name-helper/title-helper';

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

    public static getRomajiName(names: Name[]): string {
        let kanjiTitle = null;
        for (const name of names) {
            if (name.lang === 'x-jap' && name.nameType === NameType.MAIN) {
                return name.name;
            }
            if (!StringHelper.hasKanji(name.name) && !StringHelper.hasCyrillic(name.name)) {
                if (!StringHelper.hasHangul(name.name)) {
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
        const seasonsDetected = Name.getSeasonNumbersInNames(names);
        if (!Array.isArray(seasonsDetected)) {
            return seasonsDetected;
        }
        if (seasonsDetected.length === 0) {
            return response;
        }
        const mappedNumbers = seasonsDetected.map((x) => x.seasonNumber);
        const onlyNumbers = mappedNumbers.filter((x) => x) as number[];
        if (onlyNumbers) {
            const mostFrequentNumberInList = listHelper.findMostFrequent(onlyNumbers);
            if (mostFrequentNumberInList) {
                const entrys = await listHelper.countEntrysInArray(mappedNumbers, mostFrequentNumberInList);
                if (names.length / 10 <= entrys) {
                    response.seasonNumber = mostFrequentNumberInList;
                }
            }
        }
        return response;
    }

    private static getSeasonNumbersInNames(names: Name[]): SeasonNumberResponse[] | SeasonNumberResponse {
        const seasonsDetected: SeasonNumberResponse[] = [];
        for (const nameObj of names) {
            try {
                if (Name.canGetValidSeasonNumberFromName(nameObj)) {
                    const nr = StringHelper.getSeasonNumberFromTitle(nameObj.name);
                    if (nr.seasonNumber !== undefined) {
                        if (nr.absoluteResult === AbsoluteResult.ABSOLUTE_TRUE) {
                            return nr;
                        }
                        seasonsDetected.push(nr);
                    }
                } else {
                    const seasonNumber = TitleHelper.getSeasonNumberBySeasonMarkerInTitle(nameObj.name);
                    if (seasonNumber.seasonNumber !== undefined) {
                        seasonsDetected.push(seasonNumber);
                    }
                }
            } catch (err) {
                logger.debug('[getSeasonNumbersInNames] Failed extracting season from name: ' + nameObj.name);
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

    public name = '';
    public lang = '';
    public nameType: NameType = NameType.UNKNOWN;

    constructor(name: string, lang: string, nameType: NameType = NameType.UNKNOWN) {
        this.name = name.trim();
        this.lang = lang;
        this.nameType = nameType;
    }
}
