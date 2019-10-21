import SeasonNumberResponse from '../controller/objects/meta/response-object/season-number-response';
import { AbsoluteResult } from './comperators/comperator-results.ts/comperator-result';

class StringHelper {
    /**
     * It reverse a string.
     * Example:
     * test -> tset
     * @param s
     */
    public async reverseString(s: string): Promise<string> {
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
    public randomString(length: number = 10): string {
        const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return Array.from({ length }, (_) => c[Math.floor(Math.random() * c.length)]).join('');
    }

    /**
     * We need too clean title so that they can match like:
     * titleA! vs titleA
     */
    public async cleanString(s: string): Promise<string> {
        s = s.replace(/\:/, '');
        s = s.replace('！', '! ');
        s = s.replace('!', '!');
        if ((s.match(/!/g) || []).length === 1) {
            s = s.replace(/\!/, '');
        }
        if ((s.match(/\?/g) || []).length === 1) {
            s = s.replace(/\?/, '');
        }
        // title -AAA- => title AAA
        s = s.replace(' -', ' ');
        // title-A => title A
        // Remove text decorations.
        s = s.replace(/\-/g, ' ');
        s = s.replace(/\’/g, '');
        s = s.replace(/\'/g, '');
        s = s.replace(/\'/g, '');
        s = s.replace(/\./g, '');
        s = s.replace(/\`/g, '');
        s = s.replace(/\~/g, '');
        s = s.replace(/\,/g, '');
        s = s.replace(/\³/g, '3');
        s = s.replace(/\²/g, '2');
        s = s.replace(/＊/g, '');
        return s.replace(/\ \ /g, ' ').trim();
    }
    public async getSeasonNumberFromTitle(title: string): Promise<SeasonNumberResponse> {
        const response = new SeasonNumberResponse();
        if (title && isNaN(Number(title)) && title.length > 2) {
            let reversedTitle = '';
            let countLastChar = 0;
            if (title.match(/part.*\d{1,}/i)) {
                title = title.replace(/part.*\d{1,}/i, '').trim();
                reversedTitle = await this.reverseString(title);
            } else {
                reversedTitle = await this.reverseString(title);
            }
            const lastChar = reversedTitle.charAt(0);

            if (title.toLocaleLowerCase().includes('episode')) {
                throw new Error('That name dont have a Season');
            }
            if (title.match(/Season\s{1,}(\d{1,})|(\d{1,})nd|\s(s\d{1,}($|\s))/gmi)) {
                const match = /Season\s{1,}(\d{1,})|(\d{1,})nd|\s(s\d{1,}($|\s))/gmi.exec(title);
                if (match != null) {
                    if (typeof match[1] !== 'undefined') {
                        response.seasonNumber = parseInt(match[1], 10);
                        response.absoluteResult = AbsoluteResult.ABSOLUTE_TRUE;
                        return response;
                    } else if (typeof match[2] !== 'undefined') {
                        response.seasonNumber = parseInt(match[2], 10);
                        response.absoluteResult = AbsoluteResult.ABSOLUTE_TRUE;
                        return response;
                    }
                }
            } else if ('0123456789'.includes(lastChar) && !await this.hasKanji(title) && reversedTitle.charAt(1) !== '^' && !title.match(/\d{4,}$/gm)) {
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
    public async hasKanji(s: string): Promise<boolean> {
        if (s) {
            const regex = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]{1,}/;
            return s.match(regex) != null;
        }
        return false;
    }
    /**
     * Check if the string contains any korean letters.
     * @param s
     */
    public async hasHangul(s: string): Promise<boolean> {
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
    public async hasCyrillic(s: string): Promise<boolean> {
        if (s) {
            const regex = /[\u0400-\u04FF]/;
            return s.match(regex) != null;
        }
        return false;
    }
}

export default new StringHelper();
