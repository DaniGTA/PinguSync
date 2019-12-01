import * as assert from 'assert';
import Name from '../../src/backend/controller/objects/meta/name';
import WatchProgress from '../../src/backend/controller/objects/meta/watch-progress';
import Series from '../../src/backend/controller/objects/series';
import listHelper from '../../src/backend/helpFunctions/list-helper';
import TestHelper from '../test-helper';


describe('List Helper', () => {
    before(() => {
        TestHelper.mustHaveBefore();
    });
    it('should clean array', async () => {
        const arr = await listHelper.cleanArray([null, undefined, '']);
        assert.equal(arr.length, 0);
        return;
    });
    it('should get most frequency occur (1/2)', async () => {
        const arr = await listHelper.findMostFrequent([1, 1, 0, 1, 1, 0]);
        assert.equal(arr, 1);
        return;
    });
    it('should get most frequency occur (2/2)', async () => {
        const arr = await listHelper.findMostFrequent(await listHelper.cleanArray([1]));
        assert.equal(arr, 1);
        return;
    });
    it('should return undefined', async () => {
        const arr = await listHelper.findMostFrequent([]);
        assert.equal(typeof arr, 'undefined');
        return;
    });

    it('should find entry existing in list', async () => {
        const entry1 = new Series();
        entry1.id = '1';
        const entry2 = new Series();
        entry2.id = '2';
        const entry3 = new Series();
        entry3.id = '3';
        const list = [entry1, entry2, entry3];
        const result = await listHelper.isSeriesInList(list, entry2);

        assert.equal(result, true);
    });


    it('shouldnt find any entry', async () => {
        const entry1 = new Series();
        entry1.id = '1';
        const entry2 = new Series();
        entry2.id = '2';
        const entry3 = new Series();
        entry3.id = '3';
        const list = [entry1, entry3];
        const result = await listHelper.isSeriesInList(list, entry2);

        assert.equal(result, false);
    });

    it('it should look if item is in list', async () => {
        const array = ['Test', 'Test2', 'Test3'];
        assert.strictEqual(await listHelper.isItemInList(array, 'Test'), true);
        assert.strictEqual(await listHelper.isItemInList(array, 'xTestx'), false);
    });

    it('get lazy uniqe string list', async () => {
        const array = [new Name('Test', 'en'), new Name('test', 'en'), new Name('tesT', 'en'), new Name('Test2', 'en')];
        assert.strictEqual((await listHelper.getLazyUniqueStringList(array)).length, 2);
    });


    it('should check list type', async () => {

        const numberList = [1, 2, 3];
        const watchprogressList = [new WatchProgress(1), new WatchProgress(2), new WatchProgress(3)];

        assert.strictEqual(await listHelper.checkType(numberList, Number), true, 'numberList is type of number');
        assert.strictEqual(await listHelper.checkType(watchprogressList, WatchProgress), true, 'watchprogressList is type of WatchProgress');
        assert.strictEqual(await listHelper.checkType(numberList, WatchProgress), false, 'numberList is not type of WatchProgress');
        assert.strictEqual(await listHelper.checkType(watchprogressList, Number), false, 'watchprogressList is not type of Number');
    });

    it('should find entry (list in list)', async () => {
        const array = ['A', 'B', 'C'];
        const array2 = ['X', 'Y', 'C'];
        const result = await listHelper.isAnyListEntryInList(array, array2);
        assert.strictEqual(result, true);
    });

    it('should not find entry (list in list)', async () => {
        const array = ['A', 'B', 'C'];
        const array2 = ['X', 'Y', 'Z'];
        const result = await listHelper.isAnyListEntryInList(array, array2);
        assert.strictEqual(result, false);
    });

    it('should find entry object (list in list)', async () => {
        const array = [new Name('tesT', 'en'), new Name('tesT2', 'en')];
        const array2 = [new Name('tesT1', 'en'), new Name('tesT2', 'en'), new Name('tesT3', 'en')];
        const result = await listHelper.isAnyListEntryInList(array, array2);
        assert.strictEqual(result, true);
    });

    it('should not find entry object (list in list)', async () => {
        const array = [new Name('tesT', 'en'), new Name('tesT2', 'en')];
        const array2 = [new Name('tesT1', 'en'), new Name('tesT4', 'en'), new Name('tesT3', 'en')];
        const result = await listHelper.isAnyListEntryInList(array, array2);
        assert.strictEqual(result, false);
    });
});
