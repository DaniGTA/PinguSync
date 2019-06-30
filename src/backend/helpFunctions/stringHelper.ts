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
     * [!] Dont make this async.
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
}

export default new StringHelper();