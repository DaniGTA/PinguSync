import * as assert from 'assert';
import listHelper from '../../src/backend/helpFunctions/listHelper';
import Series from '../../src/backend/controller/objects/series';
import WatchProgress from '../../src/backend/controller/objects/meta/watchProgress';

describe('listHelperTest', () => {
    it('should clean array', async () => {
        var arr = await listHelper.cleanArray([null, undefined, ''])
        assert.equal(arr.length, 0);
        return;
    });
    it('should get most frequency occur (1/2)', async () => {
        var arr = await listHelper.findMostFrequent([1, 1, 0, 1, 1, 0])
        assert.equal(arr, 1);
        return;
    });
    it('should get most frequency occur (2/2)', async () => {
        var arr = await listHelper.findMostFrequent(await listHelper.cleanArray([1]))
        assert.equal(arr, 1);
        return;
    });
    it('should return undefined', async () => {
        var arr = await listHelper.findMostFrequent([])
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
        const array = ["Test", "Test2", "Test3"];
        assert.strictEqual(await listHelper.isItemInList(array, "Test"), true);
        assert.strictEqual(await listHelper.isItemInList(array, "xTestx"), false);
    });

    it('should check list type', async () => {

        const numberList = [1, 2, 3];
        const watchprogressList = [new WatchProgress(1), new WatchProgress(2), new WatchProgress(3)];

        assert.strictEqual(await listHelper.checkType(numberList, Number), true, "numberList is type of number");
        assert.strictEqual(await listHelper.checkType(watchprogressList, WatchProgress), true, "watchprogressList is type of WatchProgress");
        assert.strictEqual(await listHelper.checkType(numberList, WatchProgress), false, "numberList is not type of WatchProgress");
        assert.strictEqual(await listHelper.checkType(watchprogressList, Number), false, "watchprogressList is not type of Number");
    });
});
