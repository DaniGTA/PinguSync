class StringHelper {
    public async reverseString(s: string): Promise<string> {
        var splitString = s.split("");
        var reversedArray = splitString.reverse();
        return reversedArray.join("");
    }
    public randomString(length?: number): string {
        var l = 10;
        if (typeof length != 'undefined') {
            l = length;
        }
        const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return Array.from({ length: l }, _ => c[Math.floor(Math.random() * c.length)]).join('');
    }

    /**
     * We need too clean title so that they can match like:
     * titleA! vs titleA
     */
    public cleanString(string: string): string {
        string = string.replace(':', '');
        if ((string.match(/\!/g) || []).length == 1) {
            string = string.replace('!', '');
        }
        //title -AAA- => title AAA
        string = string.replace(' -', '');
        //title-A => title A
        string = string.replace('-', ' ');
        string = string.replace('’', '');
        string = string.replace('\'', '');
        string = string.replace('.', '');
        return string;
    }
}

export default new StringHelper();