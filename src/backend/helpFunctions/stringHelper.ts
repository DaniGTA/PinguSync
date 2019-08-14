class StringHelper {
    /**
     * It reverse a string.
     * Example:
     * test -> tset
     * @param s 
     */
    public async reverseString(s: string): Promise<string> {
        const splitString = s.split("");
        const reversedArray = splitString.reverse();
        return reversedArray.join("");
    }
    /**
     * Generates a randome string.
     * 
     * [!] Dont make this async. because it will be used by construtors.
     * @param length 
     */
    public randomString(length: number = 10): string {
        const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return Array.from({ length }, _ => c[Math.floor(Math.random() * c.length)]).join('');
    }

    /**
     * We need too clean title so that they can match like:
     * titleA! vs titleA
     */
    public async cleanString(string: string): Promise<string> {
        string = string.replace(':', '');
        if ((string.match(/!/g) || []).length == 1) {
            string = string.replace('!', '');
        }
        if ((string.match(/\?/g) || []).length == 1) {
            string = string.replace('?', '');
        }
        //title -AAA- => title AAA
        string = string.replace(' -', ' ');
        //title-A => title A
        string = string.replace('-', ' ');
        string = string.replace('’', '');
        string = string.replace("'", '');
        string = string.replace("'", '');
        string = string.replace('.', '');
        return string.replace('  ', ' ').trim();
    }
    public async getSeasonNumberFromTitle(title: string): Promise<number> {
        if (title) {
            var reversedTitle = await this.reverseString(title);
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
            }
        }
        throw 'That name dont have a Season';
    }
    /**
     * Check if the string contains any japanese letters.
     * @param s 
     */
    public async hasKanji(s: string): Promise<boolean> {
        if (s) {
            return s.match('[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]{1,}') != null;
        }
        return false;
    }
    /**
     * Check if the string contains any korean letters.
     * @param s 
     */
    public async hasHangul(s: string): Promise<boolean> {
        if (s) {
            return s.match('/[\u3131-\uD79D]/ugi') != null;
        }
        return false;
    }

    /**
     * Check if the string contains any russian letters.
     * @param s 
     */
    public async hasCyrillic(s: string): Promise<boolean> {
        if (s) {
            return s.match('/[\u0400-\u04FF]/') != null;
        }
        return false;
    }
}

export default new StringHelper();
