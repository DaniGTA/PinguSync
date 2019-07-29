import * as assert from 'assert';
import listHelper from '../../src/backend/helpFunctions/listHelper';
import { async } from 'q';
import Anime from '../../src/backend/controller/objects/anime';
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
        const entry1 = new Anime();
        entry1.id = '1';
        const entry2 = new Anime();
        entry2.id = '2';
        const entry3 = new Anime();
        entry3.id = '3';
        const list = [entry1, entry2, entry3];
        const result = await listHelper.isAnimeInList(list, entry2);

        assert.equal(result, true);
    });


    it('shouldnt find any entry', async () => {
        const entry1 = new Anime();
        entry1.id = '1';
        const entry2 = new Anime();
        entry2.id = '2';
        const entry3 = new Anime();
        entry3.id = '3';
        const list = [entry1, entry3];
        const result = await listHelper.isAnimeInList(list, entry2);

        assert.equal(result, false);
    });
});
