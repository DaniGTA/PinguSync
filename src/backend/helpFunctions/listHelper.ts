class ListHelper {
    public async cleanArray(actual: string[]): Promise<string[]> {
        const newArray: string[] = [];
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < actual.length; i++) {
            if (actual[i]) {
                newArray.push(actual[i]);
            }
        }
        return newArray;
    }

    public async removeEntrys<T>(array: T[], ...entrys: T[]): Promise<T[]> {
        for (const entry of entrys) {
            const i = array.indexOf(entry);
            if (i > -1) {
                array.splice(i, 1);
            }
        }
        return array;
    }
}

export default new ListHelper();