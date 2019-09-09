import Overview from '../controller/objects/meta/overview';
import sortHelper from './sort-helper';
import Series from '../controller/objects/series';
import Name from '../controller/objects/meta/name';
import Cover from '../controller/objects/meta/Cover';

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

    public async removeEntrys<T>(array: T[], ...entrys: T[] | readonly T[]): Promise<T[]> {
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

    async getUniqueNameList(arr: Name[]): Promise<Name[]> {
        return arr.filter((v, i, a) => a.findIndex((t) => (t.name === v.name)) === i)
    }

    async getUniqueList<T>(arr: T[]): Promise<T[]> {
        return arr.filter((v, i, a) => a.findIndex((t) => (t === v)) === i)
    }

    async getLazyUniqueStringList(arr: Name[]): Promise<Name[]> {
        return arr.filter((string, index, array) => array.findIndex((item) => (string.name.toLocaleLowerCase() === item.name.toLocaleLowerCase())) === index);
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
        for (const iterator of myArray) {
            if (!await this.is(iterator, type)) {
                return false;
            }
        }
        return true;
    }

    /**
* Sorts a list.
* 
* Default list is the main list.
* @param list 
*/
    public async sortList(list: Series[]) {
        list = await sortHelper.quickSort(list, async (a: Series, b: Series) => {
            const aNames = await a.getAllNames();
            const bNames = await b.getAllNames();
            let aName = aNames[0].name;
            let bName = bNames[0].name;
            try {
                aName = await Name.getRomajiName(aNames);
                bName = await Name.getRomajiName(bNames);
            } catch (err) { }

            aName = aName.toLocaleLowerCase();
            bName = bName.toLocaleLowerCase();

            return aName.localeCompare(bName);
        });
        return list;
    }

    public async isSeriesInList(list: Series[], item: Series): Promise<boolean> {
        return list.findIndex(entry => item.id === entry.id) != -1;
    }
    public async isItemInList<T>(list: T[], item: T): Promise<boolean> {
        return list.findIndex(x => x === item) !== -1;
    }
    public async isCoverInList(list: Cover[], item: Cover): Promise<boolean> {
        return list.findIndex(x => x.url === item.url) !== -1;
    }
}

export default new ListHelper();
