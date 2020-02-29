import * as assert from 'assert';
import timeHelper from '../../src/backend/helpFunctions/time-helper';
import TestHelper from '../test-helper';
describe('Time Helper | Small wait tests', () => {
    beforeEach(() => {
        TestHelper.mustHaveBefore();
    });
    test('should wait 50ms', async () => {
        const start = new Date().getTime();
        await timeHelper.delay(50);
        const result = new Date().getTime() - (start + 49);
        assert.equal(result >= 0, true, 'has waited: ' + result);

        return;
    });
    test('should wait 25ms', async () => {
        const start = new Date().getTime();
        await timeHelper.delay(25);
        const result = new Date().getTime() - (start + 24);
        assert.equal(result >= 0, true, 'has waited: ' + result);

        return;
    });
    test('should wait 75ms', async () => {
        const start = new Date().getTime();
        await timeHelper.delay(75);
        const result = new Date().getTime() - (start + 74);
        assert.equal(result >= 0, true, 'has waited: ' + result);

        return;
    });
});
