import * as assert from 'assert';
import Episode from '../../src/backend/controller/objects/meta/episode/episode';
import Name from '../../src/backend/controller/objects/meta/name';
import WatchProgress from '../../src/backend/controller/objects/meta/watch-progress';
import Series from '../../src/backend/controller/objects/series';
import listHelper from '../../src/backend/helpFunctions/list-helper';



describe('List Helper', () => {
    test('should clean array', async () => {
        const arr = await listHelper.cleanArray([null, undefined, '']);
        expect(arr.length).toEqual(0);
        return;
    });
    test('should get most frequency occur (1/2)', () => {
        const arr = listHelper.findMostFrequent([1, 1, 0, 1, 1, 0]);
        expect(arr).toEqual(1);
        return;
    });
    test('should get most frequency occur (2/2)', async () => {
        const arr = listHelper.findMostFrequent(await listHelper.cleanArray([1]));
        expect(arr).toEqual(1);
        return;
    });
    test('should return undefined', () => {
        const arr = listHelper.findMostFrequent([]);
        expect(arr).toBeUndefined();
        return;
    });

    test('should find entry existing in list', async () => {
        const entry1 = new Series();
        entry1.id = '1';
        const entry2 = new Series();
        entry2.id = '2';
        const entry3 = new Series();
        entry3.id = '3';
        const list = [entry1, entry2, entry3];
        const result = await listHelper.isSeriesInList(list, entry2);

        expect(result).toBeTruthy();
    });


    test('shouldnt find any entry', async () => {
        const entry1 = new Series();
        entry1.id = '1';
        const entry2 = new Series();
        entry2.id = '2';
        const entry3 = new Series();
        entry3.id = '3';
        const list = [entry1, entry3];
        const result = await listHelper.isSeriesInList(list, entry2);

        expect(result).toBeFalsy();
    });

    test('it should look if item is in list', async () => {
        const array = ['Test', 'Test2', 'Test3'];
        assert.strictEqual(await listHelper.isItemInList(array, 'Test'), true);
        expect(await listHelper.isItemInList(array, 'xTestx')).toBeFalsy();
    });

    test('get lazy uniqe string list', async () => {
        const array = [new Name('Test', 'en'), new Name('test', 'en'), new Name('tesT', 'en'), new Name('Test2', 'en')];
        expect((await listHelper.getLazyUniqueStringList(array)).length).toEqual(2);
    });


    test('should check list type', async () => {

        const numberList = [1, 2, 3];
        const watchprogressList = [new WatchProgress(1), new WatchProgress(2), new WatchProgress(3)];

        assert.strictEqual(await listHelper.checkType(numberList, Number), true, 'numberList is type of number');
        assert.strictEqual(await listHelper.checkType(watchprogressList, WatchProgress), true, 'watchprogressList is type of WatchProgress');
        assert.strictEqual(await listHelper.checkType(numberList, WatchProgress), false, 'numberList is not type of WatchProgress');
        expect(await listHelper.checkType(watchprogressList, Number)).toBeFalsy();
    });

    test('should find entry (list in list)', async () => {
        const array = ['A', 'B', 'C'];
        const array2 = ['X', 'Y', 'C'];
        const result = await listHelper.isAnyListEntryInList(array, array2);
        expect(result).toBeTruthy();
    });

    test('should not find entry (list in list)', async () => {
        const array = ['A', 'B', 'C'];
        const array2 = ['X', 'Y', 'Z'];
        const result = await listHelper.isAnyListEntryInList(array, array2);
        expect(result).toBeFalsy();
    });

    test('should find entry object (list in list)', async () => {
        const array = [new Name('tesT', 'en'), new Name('tesT2', 'en')];
        const array2 = [new Name('tesT1', 'en'), new Name('tesT2', 'en'), new Name('tesT3', 'en')];
        const result = await listHelper.isAnyListEntryInList(array, array2);
        expect(result).toBeTruthy();
    });

    test('should not find entry object (list in list)', async () => {
        const array = [new Name('tesT', 'en'), new Name('tesT2', 'en')];
        const array2 = [new Name('tesT1', 'en'), new Name('tesT4', 'en'), new Name('tesT3', 'en')];
        const result = await listHelper.isAnyListEntryInList(array, array2);
        expect(result).toBeFalsy();
    });

    test('should filter duplicates in episode list (1/2)', () => {
        const episode1 = new Episode(1);
        episode1.provider = '';
        const episode2 = new Episode(2);
        episode2.provider = '';
        const episode3 = new Episode(3);
        episode3.provider = '';
        const episode4 = new Episode(3);
        episode4.provider = '';
        const episode5 = new Episode(4);
        episode5.provider = '';

        const result = listHelper.getUniqueEpisodeList([episode1, episode2, episode3, episode5], [episode4, episode5]);

        expect(result.length).toEqual(4);
    });

    test('should filter duplicates in episode list (2/2)', () => {
        const episode1 = new Episode(1);
        episode1.provider = '';
        const episode2 = new Episode(1);
        episode2.provider = '';
        const episode3 = new Episode(2);
        episode3.provider = '';
        const episode4 = new Episode(2);
        episode4.provider = '';
        const episode5 = new Episode(3);
        episode5.provider = '';
        const episode6 = new Episode(3);
        episode6.provider = '';

        const result = listHelper.getUniqueEpisodeList([episode1, episode3, episode5], [episode4, episode5, episode2]);

        expect(result.length).toEqual(3);
    });

    test('should get a even number', () => {
        const te = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8];
        const result = listHelper.getMostFrequentNumberFromList(te);
        expect(result).toEqual(2);
    });
});
