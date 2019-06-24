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
}

export default new ListHelper();