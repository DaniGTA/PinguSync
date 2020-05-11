import TestProvider from '../../controller/objects/testClass/testProvider';

describe('External provider tests', () => {
    test('should wait 50ms for next request', async () => {
        const provider = new TestProvider('a');
        jest.restoreAllMocks();
        await provider.waitUntilItCanPerfomNextRequest();
        // tslint:disable-next-line: no-string-literal
        provider['requestRateLimitInMs'] = 50;
        provider.informAWebRequest();
        const start = new Date().getTime();
        await provider.waitUntilItCanPerfomNextRequest();
        const result = new Date().getTime() - (start + 55);
        expect(result).toBeLessThanOrEqual(0);
        return;
    });
});
