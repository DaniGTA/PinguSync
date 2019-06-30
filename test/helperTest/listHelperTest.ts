import * as assert from 'assert';
import listHelper from '../../src/backend/helpFunctions/listHelper';
describe('listHelperTest', () => {
    it('should clean array', async () => {
        var arr = await listHelper.cleanArray([null, undefined, ''])
        assert.equal(arr.length, 0);
        return;
    });
    it('should get most frequency occur', async () => {
        var arr = await listHelper.findMostFrequent([1, 1, 0, 1, 1, 0])
        assert.equal(arr, 1);
        return;
    });
});