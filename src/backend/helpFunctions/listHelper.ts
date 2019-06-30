class ListHelper {
    public async cleanArray<T>(actual: T[]): Promise<T[]> {
        const newArray: T[] = [];
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
    public async shuffle<T>(list: T[]): Promise<T[]> {
        var m = list.length, t, i;

        // While there remain elements to shuffle…
        while (m) {

            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);

            // And swap it with the current element.
            t = list[m];
            list[m] = list[i];
            list[i] = t;
        }

        return list;
    }

    public async findMostFrequent<T>(arr: T[]): Promise<T | undefined> {
        if (arr === void 0) {
            arr = [];
        }
        var current = 0;
        var max = 0;
        var mostCommonNumber: T | undefined = undefined;
        var i: number = 0;
        for (i = 0; i < arr.length - 1; i++) {
            var current_1 = 1;
            var j = 0;
            for (j = i + 1; j < arr.length; j++) {
                if (arr[i] === arr[j]) {
                    current_1++;
                }
            }
            if (current_1 > max) {
                max = current_1;
                mostCommonNumber = arr[i];
            }
        }
        return mostCommonNumber;
    }
}

export default new ListHelper();