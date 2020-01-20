import { strictEqual } from 'assert';
import TraktProvider from '../../../src/backend/api/trakt/trakt-provider';
import Season from '../../../src/backend/controller/objects/meta/season';
import Series from '../../../src/backend/controller/objects/series';
import { ProviderInfoStatus } from '../../../src/backend/controller/provider-manager/local-data/interfaces/provider-info-status';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import { AbsoluteResult } from '../../../src/backend/helpFunctions/comperators/comperator-results.ts/comperator-result';
import ProviderComperator from '../../../src/backend/helpFunctions/comperators/provider-comperator';
import ProviderDataWithSeasonInfo from '../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
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

    test('should be absolute false (same provider and wrong provider)', async () => {
        const s2 = new Series();
        const provider2A = new ListProviderLocalData(2, TraktProvider);
        provider2A.infoStatus = ProviderInfoStatus.BASIC_INFO;
        const provider2B = new ListProviderLocalData(2, 'test');
        provider2B.infoStatus = ProviderInfoStatus.BASIC_INFO;

        await s2.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(provider2A, new Season(1)));
        await s2.addProviderDatas(provider2B);

        const s1 = new Series();
        const provider1A = new ListProviderLocalData(2, TraktProvider);
        provider1A.infoStatus = ProviderInfoStatus.BASIC_INFO;
        const provider1B = new ListProviderLocalData(1, 'test');
        provider1B.infoStatus = ProviderInfoStatus.BASIC_INFO;

        await s1.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(provider1A, new Season(1)));
        await s1.addProviderDatas(provider1B);

        const instance = new ProviderComperator(s1, s2);
        const result = await instance.getCompareResult();
        // tslint:disable-next-line: no-string-literal

        strictEqual(result.isAbsolute, AbsoluteResult.ABSOLUTE_FALSE);
    });
});
