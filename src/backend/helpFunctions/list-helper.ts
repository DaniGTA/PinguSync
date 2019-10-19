import Cover from '../controller/objects/meta/cover';
import Name from '../controller/objects/meta/name';
import Overview from '../controller/objects/meta/overview';
import Series from '../controller/objects/series';
import logger from '../logger/logger';
import sortHelper from './sort-helper';

class ListHelper {

    public async findAllIndexes<T>(arr: T[], filter: (item: T) => boolean): Promise<number[]> {
        const indexes = [];
        let i;
        for (i = 0; i < arr.length; i++) {
            if (filter(arr[i])) {
                indexes.push(i);
            }
        }
        return indexes;
    }
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

    public async isAnyListEntryInList<T>(array: T[], array2: T[]): Promise<boolean>  {
        for (const entry of array) {
            for (const entry2 of array2) {
                if (this.objectEquals(entry, entry2)) {
                    return true;
                }
            }
        }
        return false;
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
        let m = list.length, t, i;

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
        let max = 0;
        let mostCommonNumber: T | undefined;
        let i: number = 0;
        for (i = 0; i < arr.length - 1; i++) {
            let current1 = 1;
            let j = 0;
            for (j = i + 1; j < arr.length; j++) {
                if (arr[i] === arr[j]) {
                    current1++;
                }
            }
            if (current1 > max) {
                max = current1;
                mostCommonNumber = arr[i];
            }
        }
        return mostCommonNumber;
    }

    public async getUniqueOverviewList(arr: Overview[]): Promise<Overview[]> {
        return arr.filter((v, i, a) => a.findIndex((t) => (t.content === v.content)) === i);
    }

    public async getUniqueNameList(arr: Name[]): Promise<Name[]> {
        return arr.filter((v, i, a) => a.findIndex((t) => (t.name === v.name)) === i);
    }

    public async getUniqueList<T>(arr: T[]): Promise<T[]> {
        return arr.filter((v, i, a) => a.findIndex((t) => (t === v)) === i);
    }

    public async getLazyUniqueStringList(arr: Name[]): Promise<Name[]> {
        return arr.filter((s, index, array) => array.findIndex((item) => (s.name.toLocaleLowerCase() === item.name.toLocaleLowerCase())) === index);
    }

    public async is<T>(obj: any, type: { prototype: T }): Promise<T>;
    public async is(obj: any, type: any): Promise<boolean> {
        const objType: string = typeof obj;
        const typeString = type.toString();
        const nameRegex: RegExp = /Arguments|Function|String|Number|Date|Array|Boolean|RegExp/;

        let typeName: string;

        if (obj && objType === 'object') {
            return obj instanceof type;
        }

        if (typeString.startsWith('class ')) {
            return type.name.toLowerCase() === objType;
        }

        typeName = typeString.match(nameRegex);
        if (typeName) {
            return typeName[0].toLowerCase() === objType;
        }

        return false;
    }

    public async checkType(myArray: any[], type: any): Promise<boolean> {
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
            const aNames = await a.getAllNamesUnique();
            const bNames = await b.getAllNamesUnique();
            let aName = aNames[0].name;
            let bName = bNames[0].name;
            try {
                aName = await Name.getRomajiName(aNames);
                bName = await Name.getRomajiName(bNames);
            } catch (err) {
               logger.error(err);
            }

            aName = aName.toLocaleLowerCase();
            bName = bName.toLocaleLowerCase();

            return aName.localeCompare(bName);
        });
        return list;
    }

    public async isSeriesInList(list: Series[], item: Series): Promise<boolean> {
        return list.findIndex((entry) => item.id === entry.id) !== -1;
    }
    public async isItemInList<T>(list: T[], item: T): Promise<boolean> {
        return list.findIndex((x) => x === item) !== -1;
    }
    public async isCoverInList(list: Cover[], item: Cover): Promise<boolean> {
        return list.findIndex((x) => x.url === item.url) !== -1;
    }

    private objectEquals(x: any, y: any): boolean {
    'use strict';

    if (x === null || x === undefined || y === null || y === undefined) { return x === y; }
    // after this just checking type of one would be enough
    if (x.constructor !== y.constructor) { return false; }
    // if they are functions, they should exactly refer to same one (because of closures)
    if (x instanceof Function) { return x === y; }
    // if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
    if (x instanceof RegExp) { return x === y; }
    if (x === y || x.valueOf() === y.valueOf()) { return true; }
    if (Array.isArray(x) && x.length !== y.length) { return false; }

    // if they are dates, they must had equal valueOf
    if (x instanceof Date) { return false; }

    // if they are strictly equal, they both need to be object at least
    if (!(x instanceof Object)) { return false; }
    if (!(y instanceof Object)) { return false; }

    // recursive object equality check
    const p = Object.keys(x);
    return Object.keys(y).every((i) => p.indexOf(i) !== -1) &&
        p.every((i) => this.objectEquals(x[i], y[i]));
}
}

export default new ListHelper();
