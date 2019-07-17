import * as assert from 'assert';
import listHelper from '../../src/backend/helpFunctions/listHelper';
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
});
