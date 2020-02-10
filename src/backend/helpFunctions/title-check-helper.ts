import { MediaType } from '../controller/objects/meta/media-type';
import SeasonNumberResponse from '../controller/objects/meta/response-object/season-number-response';
import Series from '../controller/objects/series';
import logger from '../logger/logger';
import { AbsoluteResult } from './comperators/comperator-results.ts/comperator-result';
import stringHelper from './string-helper';

export default class TitleCheckHelper {
    public static async checkSeriesNames(a: Series, b: Series): Promise<boolean> {
        const aNamesUnique = a.getAllNamesUnique();
        const bNamesUnique = b.getAllNamesUnique();
        const aNameList: string[] = (await aNamesUnique).flatMap((x) => x.name);
        const bNameList: string[] = (await bNamesUnique).flatMap((x) => x.name);
        return this.checkNames(aNameList, bNameList);
    }

    public static async checkNames(aNameList: string[], bNameList: string[]) {
        if (await TitleCheckHelper.fastMatch(aNameList, bNameList)) {
            const aCleanedNameList = TitleCheckHelper.cleanStringList(aNameList);
            const bCleanedNameList = TitleCheckHelper.cleanStringList(bNameList);
            if (await this.checkAnimeNamesInArray(await aCleanedNameList, await bCleanedNameList)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Clean all strings and add cleaned string to the list.
     * @param nameList 
     * @returns a list with uncleaned and cleaned strings.
     */
    private static async cleanStringList(nameList: string[]): Promise<string[]> {
        for (const name of nameList) {
            try {
                let bName2 = stringHelper.cleanString(name);
                bName2 = await this.removeMediaTypeFromTitle(bName2);
                bName2 = await this.removeSeasonMarkesFromTitle(bName2);
                if (bName2 !== name) {
                    nameList.push(bName2);
                }
            } catch (err) {
                continue;
            }
        }
        return nameList;
    }


    public static async checkAnimeNamesInArray(a: string[], b: string[]): Promise<boolean> {
        for (let aName of [...a]) {
            if (aName != null && aName !== '') {
                for (let bName of [...b]) {

                    if (bName != null && aName !== '') {
                        aName = aName.toLocaleLowerCase().trim();
                        bName = bName.toLocaleLowerCase().trim();
                        if (aName === bName) {
                            return true;
                        }
                        aName = stringHelper.cleanString(aName);
                        bName = stringHelper.cleanString(bName);
                        if (aName === bName) {
                            return true;
                        }
                        const tempAName = this.removeSeasonMarkesFromTitle(aName);
                        const tempBName = this.removeSeasonMarkesFromTitle(bName);
                        if (await tempAName === await tempBName) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    public static async fastMatch(aList: string[], bList: string[]): Promise<boolean> {
        try {
            const al = [...aList];
            const bl = [...bList];
            for (const a of al) {
                if (a) {
                    for (const b of bl) {
                        if (b) {
                            if (!this.equalIgnoreCase(a.substring(0, 3), b.substring(0, 3))) {
                                continue;
                            }
                            let shortestTextLength = 0;
                            if (a.length < b.length) {
                                shortestTextLength = a.length;
                            } else {
                                shortestTextLength = b.length;
                            }
                            let shortScan = Math.ceil(shortestTextLength / 4);
                            if (shortScan < 3) {
                                shortScan = Math.ceil(shortestTextLength / 1.25);
                            } else if (shortScan > 10) {
                                shortScan = 5;
                            }
                            const aResult = a.substring(0, shortScan);
                            const bResult = b.substring(0, shortScan);

                            const result = this.equalIgnoreCase(aResult, bResult);
                            if (result) {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    public static async removeSeasonMarkesFromTitle(title: string): Promise<string> {
        if (title !== '') {
            let reversedTitle = await stringHelper.reverseString(title);
            const lastChar = reversedTitle.charAt(0);
            let countLastChar = 0;
            if (title.match(/Season\s{1,}(\d{1,})|(\d{1,})nd.Season|(\d{1,})nd/gmi)) {
                const match = /Season\s{1,}(\d{1,})|(\d{1,})nd.Season|(\d{1,})nd/gmi.exec(title);
                if (match != null) {
                    return title.replace(match[0], '').replace('  ', ' ').trim();
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

                if (countLastChar !== 1) {
                    return (await stringHelper.reverseString(reversedTitle)).replace('  ', ' ').trim();
                }
            }
        }
        return title;
    }

    public static async getSeasonNumberBySeasonMarkerInTitle(title: string): Promise<SeasonNumberResponse> {
        const response = new SeasonNumberResponse();
        const regex = /Season\s{1,}(\d{1,})|(\d{1,})nd|\s(s(\d{1,})($|\s))/gmi;
        const isNumber = /^\d+$/;
        const match = regex.exec(title);
        if (match) {
            if (match != null) {
                if (isNumber.test(match[1])) {
                    response.seasonNumber = parseInt(match[1], 10);
                    response.absoluteResult = AbsoluteResult.ABSOLUTE_TRUE;
                    return response;
                } else if (isNumber.test(match[2])) {
                    response.seasonNumber = parseInt(match[2], 10);
                    response.absoluteResult = AbsoluteResult.ABSOLUTE_TRUE;
                    return response;
                } else if (isNumber.test(match[4])) {
                    response.seasonNumber = parseInt(match[4], 10);
                    response.absoluteResult = AbsoluteResult.ABSOLUTE_TRUE;
                    return response;
                }
            }
        }
        response.absoluteResult = AbsoluteResult.ABSOLUTE_NONE;
        return response;
    }

    public static getMediaTypeFromTitle(title: string): MediaType {
        if (title.match(/(:|: | )Movie(\W|$|\_)/)) {
            return MediaType.MOVIE;
        }

        if (title.match(/(:|: | )Gekijouban(\W|$|\_)/)) {
            return MediaType.MOVIE;
        }


        if (title.match(/(:|: | )Specials(\W|$|\_)/)) {
            return MediaType.SPECIAL;
        }

        if (title.match(/(:|: | )Special(\W|$|\_)/)) {
            return MediaType.SPECIAL;
        }

        if (title.match(/(:|: | )OVA(\W|$|\_)/)) {
            return MediaType.SPECIAL;
        }

        return MediaType.UNKOWN;
    }

    public static async removeMediaTypeFromTitle(title: string): Promise<string> {
        title = title.replace(/ Movie:/g, ':');
        title = title.replace(/Movie/g, '');
        title = title.replace(/Specials/g, '');
        title = title.replace(/Special/g, '');
        title = title.replace(/ Gekijouban:/g, ':');
        title = title.replace(/Gekijouban/g, '');
        title = title.replace(/:\s*$/gm, '');
        return title.trim();
    }

    private static equalIgnoreCase(s1: string, s2: string) {
        return s1.toUpperCase() === s2.toUpperCase();
    }
};
