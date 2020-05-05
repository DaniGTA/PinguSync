import SeasonNumberResponse from '../controller/objects/meta/response-object/season-number-response';
import { AbsoluteResult } from './comperators/comperator-results.ts/comperator-result';
import TitleHelper from './name-helper/title-helper';

export default class StringHelper {
    /**
     * It reverse a string.
     * Example:
     * test -> tset
     * @param s
     */
    public static reverseString(s: string): string {
        const splitString = s.split('');
        const reversedArray = splitString.reverse();
        return reversedArray.join('');
    }
    /**
     * Generates a randome string.
     *
     * [!] Dont make this async. because it will be used by construtors.
     * @param length
     */
    public static randomString(length = 10): string {
        const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return Array.from({ length }, () => c[Math.floor(Math.random() * c.length)]).join('');
    }

    /**
     * We need too clean title so that they can match like:
     * titleA! vs titleA
     */
    public static cleanString(s: string): string {
        s = s.replace(/:/, '');
        s = s.replace('！', '! ');
        s = s.replace('!', '!');
        if ((s.match(/!/g) || []).length === 1) {
            s = s.replace(/!/, '');
        }
        if ((s.match(/\?/g) || []).length === 1) {
            s = s.replace(/\?/, '');
        }
        // title -AAA- => title AAA
        s = s.replace(' -', ' ');
        // title-A => title A
        // Remove text decorations.
        s = s.replace(/-/g, ' ');
        s = s.replace(/’/g, '');
        s = s.replace(/'/g, '');
        s = s.replace(/'/g, '');
        s = s.replace(/\./g, '');
        s = s.replace(/`/g, '');
        s = s.replace(/~/g, '');
        s = s.replace(/,/g, '');
        s = s.replace(/³/g, '3');
        s = s.replace(/²/g, '2');
        s = s.replace(/＊/g, '');
        return s.replace(/ {2}/g, ' ').trim();
    }
    public static getSeasonNumberFromTitle(title: string): SeasonNumberResponse {
        const response = new SeasonNumberResponse();
        if (title && isNaN(Number(title)) && title.length > 2) {
            let reversedTitle = '';
            let countLastChar = 0;
            if (/part.*\d{1,}/i.exec(title) !== null) {
                title = title.replace(/part.*\d{1,}/i, '').trim();
                reversedTitle = this.reverseString(title);
            } else {
                reversedTitle = this.reverseString(title);
            }

            if (title.toLocaleLowerCase().includes('episode')) {
                throw new Error('That name dont have a Season');
            }
            const seasonMarkerResult = TitleHelper.getSeasonNumberBySeasonMarkerInTitle(title);

            if (seasonMarkerResult.absoluteResult === AbsoluteResult.ABSOLUTE_TRUE) {
                return seasonMarkerResult;
            }

            const lastChar = reversedTitle.charAt(0);

            if (this.isNumber(lastChar) && reversedTitle.charAt(1) !== '^' && !title.match(/\d{4,}$/gm)) {
                response.seasonNumber = parseInt(lastChar, 10);
                return response;
            } else if (['I'].includes(lastChar)) {
                while (lastChar === reversedTitle.charAt(0)) {
                    countLastChar++;
                    reversedTitle = reversedTitle.substr(1);
                }
            } else if (['X'].includes(lastChar)) {
                while (lastChar === reversedTitle.charAt(0)) {
                    countLastChar++;
                    reversedTitle = reversedTitle.substr(1);
                }
            } else if (['A'].includes(lastChar)) {
                while (lastChar === reversedTitle.charAt(0)) {
                    countLastChar++;
                    reversedTitle = reversedTitle.substr(1);
                }
                if (countLastChar > 2) {
                    countLastChar = 0;
                }
            }
            if (countLastChar > 1) {
                response.seasonNumber = countLastChar;
                return response;
            }
        }
        throw new Error('That title dont have a Season: ' + title);
    }

    /**
     * Check if the string contains any japanese letters.
     * @param s
     */
    public static hasKanji(s: string): boolean {
        if (s) {
            const regex = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]{1,}/;
            return regex.exec(s) != null;
        }
        return false;
    }
    /**
     * Check if the string contains any korean letters.
     * @param s
     */
    public static hasHangul(s: string): boolean {
        if (s) {
            const regex = /[\u3131-\uD79D]/ugi;
            return s.match(regex) != null;
        }
        return false;
    }

    /**
     * Check if the string contains any russian letters.
     * @param s
     */
    public static hasCyrillic(s: string): boolean {
        if (s) {
            const regex = /[\u0400-\u04FF]/;
            return regex.exec(s) != null;
        }
        return false;
    }

    /**
     * Checks if string has only letters from the basic latin table:
     * http://memory.loc.gov/diglib/codetables/42.html
     * @param s string
     */
    public static isOnlyBasicLatin(s: string): boolean {
        if (s) {
            const regex = /[\u0020-\u007E]*/;
            const result = regex.exec(s) ?? [];
            return s.length === result[0]?.length;
        }
        return false;
    }

    public static isNumber(s: string): boolean {
        return (s >= '0' && s <= '9');
    }

}
