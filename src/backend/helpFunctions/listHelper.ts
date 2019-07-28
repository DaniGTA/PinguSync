import Overview from '../controller/objects/overview';
import sortHelper from './sortHelper';
import Anime from '../controller/objects/anime';
import Names from '../controller/objects/names';

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
        } else if (arr.length === 0) {
            return;
        } else if (arr.length === 1) {
            return arr[0];
        }
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

    async getUniqueOverviewList(arr: Overview[]): Promise<Overview[]> {
        return arr.filter((v, i, a) => a.findIndex((t) => (t.content === v.content)) === i)
    }

    async getUniqueList<T>(arr: T[]): Promise<T[]> {
        return arr.filter((v, i, a) => a.findIndex((t) => (t === v)) === i)
    }

    async is<T>(obj: any, type: { prototype: T }): Promise<T>;
    async is(obj: any, type: any): Promise<boolean> {
        const objType: string = typeof obj;
        const typeString = type.toString();
        const nameRegex: RegExp = /Arguments|Function|String|Number|Date|Array|Boolean|RegExp/;

        let typeName: string;

        if (obj && objType === "object") {
            return obj instanceof type;
        }

        if (typeString.startsWith("class ")) {
            return type.name.toLowerCase() === objType;
        }

        typeName = typeString.match(nameRegex);
        if (typeName) {
            return typeName[0].toLowerCase() === objType;
        }

        return false;
    }

    async checkType(myArray: any[], type: any): Promise<boolean> {
        return myArray.every(async (item) => {
            return await this.is(item, type);
        });
    }

            /**
     * Sorts a list.
     * 
     * Default list is the main list.
     * @param list 
     */
    public async sortList(list: Anime[]) {
        list = await sortHelper.quickSort(list, async (a: Anime, b: Anime) => {
            let aName: string = await Object.assign(new Names(), a.names).getRomajiName();
            let bName = await Object.assign(new Names(), b.names).getRomajiName();

            aName = aName.toLocaleLowerCase();
            bName = bName.toLocaleLowerCase();

            return aName.localeCompare(bName);
        });
        return list;
    }
}

export default new ListHelper();
