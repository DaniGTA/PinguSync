import { MediaType } from '../../controller/objects/meta/media-type';
import Series from '../../controller/objects/series';
import logger from '../../logger/logger';
import StringHelper from '../string-helper';

export default class TitleCheckHelper {
    public static async checkSeriesNames(a: Series, b: Series): Promise<boolean> {
        const aNamesUnique = a.getAllNamesUnique();
        const bNamesUnique = b.getAllNamesUnique();
        const aNameList: string[] = (await aNamesUnique).flatMap((x) => x.name);
        const bNameList: string[] = (await bNamesUnique).flatMap((x) => x.name);
        return this.checkNames(aNameList, bNameList);
    }

    public static checkNames(aNameList: string[], bNameList: string[]): boolean {
        if (TitleCheckHelper.fastMatch(aNameList, bNameList)) {
            const aCleanedNameList = TitleCheckHelper.cleanStringList(aNameList);
            const bCleanedNameList = TitleCheckHelper.cleanStringList(bNameList);
            if (this.checkAnimeNamesInArray(aCleanedNameList, bCleanedNameList)) {
                return true;
            }
        }
        return false;
    }


    public static checkAnimeNamesInArray(a: string[], b: string[]): boolean {
        for (let aName of [...a]) {
            if (aName != null && aName !== '') {
                for (let bName of [...b]) {

                    if (bName != null && aName !== '') {
                        aName = aName.toLocaleLowerCase().trim();
                        bName = bName.toLocaleLowerCase().trim();
                        if (aName === bName) {
                            return true;
                        }
                        aName = StringHelper.cleanString(aName);
                        bName = StringHelper.cleanString(bName);
                        if (aName === bName) {
                            return true;
                        }
                        const tempAName = this.removeSeasonMarkesFromTitle(aName);
                        const tempBName = this.removeSeasonMarkesFromTitle(bName);
                        if (tempAName === tempBName) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    public static fastMatch(aList: string[], bList: string[]): boolean {
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

    public static removeSeasonMarkesFromTitle(title: string): string {
        if (title !== '') {
            let reversedTitle = StringHelper.reverseString(title);
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
                return (StringHelper.reverseString(reversedTitle.substr(1))).trim();
            } else {
                while (lastChar === reversedTitle.charAt(0)) {
                    countLastChar++;
                    reversedTitle = reversedTitle.substr(1);
                }

                if (countLastChar !== 1) {
                    return (StringHelper.reverseString(reversedTitle)).replace('  ', ' ').trim();
                }
            }
        }
        return title;
    }

    public static getMediaTypeFromTitle(title: string): MediaType {
        if (this.hasTitleMovieInformation(title)) {
            return MediaType.MOVIE;
        }

        if (this.hasTitleSpecialInformation(title)) {
            return MediaType.SPECIAL;
        }

        if (this.hasTitleSeriesInformation(title)) {
            return MediaType.UNKOWN_SERIES;
        }
        return MediaType.UNKOWN;
    }

    public static removeMediaTypeFromTitle(title: string): string {
        title = title.replace(/ Movie:/gi, ':');
        title = title.replace(/Movie/gi, '');
        title = title.replace(/Specials/gi, '');
        title = title.replace(/Special/gi, '');
        title = title.replace(/ Gekijouban:/gi, ':');
        title = title.replace(/Gekijouban/gi, '');
        title = title.replace(/\(tv\)/gi, '');
        title = title.replace(/:\s*$/gmi, '');
        return title.trim();
    }

    private static hasTitleSeriesInformation(title: string): boolean {
        if (/(-|:|: | )TV(\W|$|_)/i.exec(title)) {
            return true;
        }

        if (/(:|: | )\(tv\)(\W|$|_)/i.exec(title)) {
            return true;
        }
        return false;
    }

    private static hasTitleMovieInformation(title: string): boolean {
        if (/(-|:|: | )Movie(\W|$|_)/i.exec(title)) {
            return true;
        }

        if (/(:|: | )Gekijouban(\W|$|_)/i.exec(title)) {
            return true;
        }
        return false;
    }

    private static hasTitleSpecialInformation(title: string): boolean {
        if (/(:|: | )OVA(\W|$|_)/i.exec(title)) {
            return true;
        }

        if (/(:|: | )Specials(\W|$|_)/i.exec(title)) {
            return true;
        }

        if (/(:|: | )Special(\W|$|_)/i.exec(title)) {
            return true;
        }
        return false;
    }
    /**
     * Clean all strings and add cleaned string to the list.
     * @param nameList
     * @returns a list with uncleaned and cleaned strings.
     */
    private static cleanStringList(nameList: string[]): string[] {
        for (const name of nameList) {
            try {
                let bName2 = StringHelper.cleanString(name);
                bName2 = this.removeMediaTypeFromTitle(bName2);
                bName2 = this.removeSeasonMarkesFromTitle(bName2);
                if (bName2 !== name) {
                    nameList.push(bName2);
                }
            } catch (err) {
                logger.debug('Cant clean string list.');
                logger.debug(err);
                continue;
            }
        }
        return nameList;
    }

    private static equalIgnoreCase(s1: string, s2: string): boolean {
        return s1.toUpperCase() === s2.toUpperCase();
    }
}
