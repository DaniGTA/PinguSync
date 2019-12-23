import { strictEqual } from 'assert';
import Series from '../../../src/backend/controller/objects/series';
import { ProviderInfoStatus } from '../../../src/backend/controller/provider-manager/local-data/interfaces/provider-info-status';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import { AbsoluteResult } from '../../../src/backend/helpFunctions/comperators/comperator-results.ts/comperator-result';
import ProviderComperator from '../../../src/backend/helpFunctions/comperators/provider-comperator';
import TestHelper from '../../test-helper';

describe('Provider Comperator | Testrun', () => {
    beforeAll(() => {
        TestHelper.mustHaveBefore();
    });
    test('should be absolute false (same provider and wrong id)', async () => {
        const instance = new ProviderComperator(new Series(), new Series());

        const providerA = new ListProviderLocalData(2, 'test');
        providerA.infoStatus = ProviderInfoStatus.ADVANCED_BASIC_INFO;
        const providerB = new ListProviderLocalData(1, 'test');
        providerB.infoStatus = ProviderInfoStatus.ADVANCED_BASIC_INFO;
        // tslint:disable-next-line: no-string-literal
        const result = instance['compareProviderAWithProviderB'](providerA, providerB);
        strictEqual(result.isAbsolute, AbsoluteResult.ABSOLUTE_FALSE);
    });
});
