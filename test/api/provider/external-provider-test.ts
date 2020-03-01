import { strictEqual } from 'assert';
import TestProvider from '../../controller/objects/testClass/testProvider';
import TestHelper from '../../test-helper';

describe('External provider tests', () => {
    beforeAll(() => {
        TestHelper.mustHaveBefore();
    });

    test('should wait 50ms for next request', async () => {
        const provider = new TestProvider('a');
        // tslint:disable-next-line: no-string-literal
        provider['requestRateLimitInMs'] = 50;
        provider.informAWebRequest();
        const start = new Date().getTime();
        await provider.waitUntilItCanPerfomNextRequest();
        const result = new Date().getTime() - (start + 49);
        strictEqual(result >= 0, true, 'has waited: ' + result);
        return;
    });
});
