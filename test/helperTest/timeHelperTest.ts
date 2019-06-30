import * as assert from 'assert';
import timeHelper from '../../src/backend/helpFunctions/timeHelper';
describe('timeHelperTest', () => {
    it('should wait 500ms', async () => {
        const start = new Date().getTime();
        await timeHelper.delay();
        const result = new Date().getTime() - (start + 500);
        assert.equal(result >= 0, true, 'has waited: ' + result);

        return;
    });
});