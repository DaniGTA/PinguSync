import timeHelper from '../../src/backend/helpFunctions/time-helper';

describe('Time Helper | Small wait tests', () => {
    /**
     * 5ms test toleranze
     */
    test('should wait 50ms', async () => {
        const start = new Date().getTime();
        await timeHelper.delay(50);
        const result = new Date().getTime() - (start + 55);
        expect(result).toBeLessThanOrEqual(0);
        return;
    });
});
