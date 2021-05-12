import TestListProvider from '../../controller/objects/testClass/testListProvider';

describe('External provider tests', () => {
    test('should wait 50ms for next request', async () => {
        const provider = new TestListProvider();
        jest.restoreAllMocks();
        // tslint:disable-next-line: no-string-literal
        provider['requestRateLimitInMs'] = 50;
        provider.informAWebRequest();
        const start = new Date().getTime();
        await provider.waitUntilItCanPerfomNextRequest();
        const result = new Date().getTime() - (start + 49);
        expect(result).toBeGreaterThanOrEqual(0);
        return;
    });
});
