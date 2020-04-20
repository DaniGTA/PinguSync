import { strictEqual } from 'assert';
import MultiProviderResult from '../../../../src/backend/api/provider/multi-provider-result';
import { FailedRequestError } from '../../../../src/backend/controller/objects/meta/failed-request';
import Name from '../../../../src/backend/controller/objects/meta/name';
import ProviderDataListManager from '../../../../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-manager';
import { ListProviderLocalData } from '../../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import DownloadProviderLocalDataWithId from '../../../../src/backend/helpFunctions/provider/provider-info-downloader/download-provider-local-data-with-id';
import ProviderLocalDataWithSeasonInfo from '../../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import TestProvider from '../../../controller/objects/testClass/testProvider';

describe('Download provider local data with provider id', () => {
    beforeEach(() => {
        // tslint:disable-next-line: no-string-literal
        ProviderDataListManager['providerDataList'] = [];
    });

    test('should download without problems.', async () => {
        const provider = new TestProvider('Test');

        const resultListProvider = new ListProviderLocalData(1, 'Test');
        resultListProvider.addSeriesName(new Name('a', ''));

        jest.spyOn(provider, 'getFullInfoById').mockImplementation(async () =>
            new MultiProviderResult(new ProviderLocalDataWithSeasonInfo(resultListProvider)));

        const result = await DownloadProviderLocalDataWithId.download(provider, new ListProviderLocalData(1, 'Test'));

        strictEqual(result.mainProvider.providerLocalData.id, resultListProvider.id);
    });


    test('should catch failed download (error with error msg)', async () => {
        const provider = new TestProvider('Test');

        const resultListProvider = new ListProviderLocalData(1, 'Test');
        resultListProvider.addSeriesName(new Name('a', ''));

        jest.spyOn(provider, 'getFullInfoById').mockImplementation(async () => { throw new Error('Failed download'); });
        try {
            await DownloadProviderLocalDataWithId.download(provider, new ListProviderLocalData(1, 'Test'));
            fail();
        } catch (err) {
            strictEqual(err, FailedRequestError.ProviderNoResult);
        }
    });

    test('should catch failed download (error with error id)', async () => {
        const provider = new TestProvider('Test');

        const resultListProvider = new ListProviderLocalData(1, 'Test');
        resultListProvider.addSeriesName(new Name('a', ''));

        jest.spyOn(provider, 'getFullInfoById').mockImplementation(async () => { throw FailedRequestError.ProviderNotAvailble; });
        try {
            await DownloadProviderLocalDataWithId.download(provider, new ListProviderLocalData(1, 'Test'));
            fail();
        } catch (err) {
            strictEqual(err, FailedRequestError.ProviderNotAvailble);
        }
    });
});
