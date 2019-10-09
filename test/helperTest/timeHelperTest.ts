import * as assert from 'assert';
import timeHelper from '../../src/backend/helpFunctions/time-helper';
describe('Time Helper | Small wait tests', () => {
    it('should wait 50ms', async () => {
        const start = new Date().getTime();
        await timeHelper.delay(50);
        const result = new Date().getTime() - (start + 50);
        assert.equal(result >= 0, true, 'has waited: ' + result);

        return;
    });
    it('should wait 25ms', async () => {
        const start = new Date().getTime();
        await timeHelper.delay(25);
        const result = new Date().getTime() - (start + 25);
        assert.equal(result >= 0, true, 'has waited: ' + result);

        return;
    });
    it('should wait 75ms', async () => {
        const start = new Date().getTime();
        await timeHelper.delay(75);
        const result = new Date().getTime() - (start + 75);
        assert.equal(result >= 0, true, 'has waited: ' + result);

        return;
    });
});
