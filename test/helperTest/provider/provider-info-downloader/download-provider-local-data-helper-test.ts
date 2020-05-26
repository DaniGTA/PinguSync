import { strictEqual } from 'assert';
import MultiProviderResult from '../../../../src/backend/api/provider/multi-provider-result';
import { FailedRequestError } from '../../../../src/backend/controller/objects/meta/failed-request';
import Name from '../../../../src/backend/controller/objects/meta/name';
import Series from '../../../../src/backend/controller/objects/series';
import ProviderDataListManager from '../../../../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-manager';
import { ListProviderLocalData } from '../../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import downloadProviderLocalDataHelper from '../../../../src/backend/helpFunctions/provider/provider-info-downloader/download-provider-local-data-helper';
import DownloadSettings from '../../../../src/backend/helpFunctions/provider/provider-info-downloader/download-settings';
import ProviderLocalDataWithSeasonInfo from '../../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import TestInfoProvider from '../../../controller/objects/testClass/testInfoProvider';
import TestProvider from '../../../controller/objects/testClass/testProvider';

// tslint:disable: no-string-literal
describe('Provider local data downloader tests (download-provider-local-data-helper.ts)', () => {
    beforeEach(() => {
        ProviderDataListManager['providerDataList'] = [];
    });

    test('should download provider local data (no id)', async () => {

        ProviderList['loadedListProvider'] = [new TestProvider('Test2', false, true)];
        const series = new Series();

        const listProvider = new ListProviderLocalData(1, 'Test2');
        listProvider.addSeriesName(new Name('a', ''));

        await series.addListProvider(listProvider);
        const provider = new TestInfoProvider('Test');

        const resultListProvider = new ListProviderLocalData(1, 'Test');
        resultListProvider.addSeriesName(new Name('a', ''));

        jest.spyOn(provider, 'getMoreSeriesInfoByName').mockImplementation(async () =>
            [new MultiProviderResult(new ProviderLocalDataWithSeasonInfo(resultListProvider))]);

        const a = await downloadProviderLocalDataHelper.downloadProviderLocalData(series, provider);

        expect(a.mainProvider.providerLocalData.id).toEqual(1);
    });

    test('should dont have a result (no id)', async () => {
        // tslint:disable: no-string-literal
        ProviderList['loadedListProvider'] = [new TestProvider('Test2', false, true)];
        const series = new Series();

        const listProvider = new ListProviderLocalData(1, 'Test2');
        listProvider.addSeriesName(new Name('a', ''));

        await series.addListProvider(listProvider);
        const provider = new TestInfoProvider('Test');

        const resultListProvider = new ListProviderLocalData(1, 'Test');

        jest.spyOn(provider, 'getMoreSeriesInfoByName').mockImplementation(async () =>
            [new MultiProviderResult(new ProviderLocalDataWithSeasonInfo(resultListProvider))]);
        try {
            await downloadProviderLocalDataHelper.downloadProviderLocalData(series, provider);
            fail('should throw FailedRequestError.ProviderNoResult');
        } catch (err) {
            strictEqual(err, FailedRequestError.ProviderNoResult);
        }
    });

    test('should say that provider is not avaible (no id)', async () => {
        // tslint:disable: no-string-literal
        ProviderList['loadedListProvider'] = [new TestProvider('Test2', false, true)];
        const series = new Series();

        const listProvider = new ListProviderLocalData(1, 'Test2');
        listProvider.addSeriesName(new Name('a', ''));

        await series.addListProvider(listProvider);
        const provider = new TestInfoProvider('Test');
        provider.isProviderAvailable = async () => false;
        try {
            await downloadProviderLocalDataHelper.downloadProviderLocalData(series, provider);
            fail();
        } catch (err) {
            strictEqual(err, FailedRequestError.ProviderNotAvailble);
        }
    });

    describe('timeout', () => {
        let spy: jest.SpyInstance<any, unknown[]>;
        beforeAll(() => {
            spy = jest.spyOn(DownloadSettings, 'requestTimoutPromise' as any).mockImplementation(async () => {
                return new Promise<void>((resolve, reject) => setTimeout(() => {
                    reject(FailedRequestError.Timeout);
                }, 100));
            });
        });

        afterAll(() => {
            spy?.mockClear();
        });

        test('should timeout (no id)', async () => {

            // tslint:disable: no-string-literal
            ProviderList['loadedListProvider'] = [new TestProvider('Test2', false, true)];
            const series = new Series();

            const listProvider = new ListProviderLocalData(1, 'Test2');
            listProvider.addSeriesName(new Name('a', ''));

            await series.addListProvider(listProvider);
            const provider = new TestInfoProvider('Test');
            // Delay function
            provider.getMoreSeriesInfoByName = async () => new Promise<MultiProviderResult[]>((resolve) => {
                setTimeout(() => {
                    resolve([]);
                }, 101);
            });
            await expect(downloadProviderLocalDataHelper.downloadProviderLocalData(series, provider)).rejects.toEqual(FailedRequestError.Timeout);
        });
    });

    test('should dont have a result (with id)', async () => {
        // tslint:disable: no-string-literal
        ProviderList['loadedListProvider'] = [new TestProvider('Test', false, true)];
        const series = new Series();

        const listProvider = new ListProviderLocalData(1, 'Test');
        listProvider.addSeriesName(new Name('a', ''));

        await series.addListProvider(listProvider);
        const provider = new TestInfoProvider('Test');
        jest.spyOn(provider, 'getFullInfoById').mockImplementation(async () => { throw new Error('no result'); });

        try {
            await downloadProviderLocalDataHelper.downloadProviderLocalData(series, provider);
            fail('should throw FailedRequestError.ProviderNoResult');
        } catch (err) {
            strictEqual(err, FailedRequestError.ProviderNoResult);
        }
    });

    test('should say that provider is not avaible (with id)', async () => {
        // tslint:disable: no-string-literal
        ProviderList['loadedListProvider'] = [new TestProvider('Test', false, true)];
        const series = new Series();

        const listProvider = new ListProviderLocalData(1, 'Test');
        listProvider.addSeriesName(new Name('a', ''));

        await series.addListProvider(listProvider);
        const provider = new TestInfoProvider('Test');
        jest.spyOn(provider, 'isProviderAvailable').mockImplementation(async () => false);
        await expect(downloadProviderLocalDataHelper.downloadProviderLocalData(series, provider)).rejects.toEqual(FailedRequestError.ProviderNotAvailble);
    });

    test('should timeout (with id)', async () => {
        // tslint:disable: no-string-literal
        ProviderList['loadedListProvider'] = [new TestProvider('Test', false, true)];
        const series = new Series();

        const listProvider = new ListProviderLocalData(1, 'Test');
        listProvider.addSeriesName(new Name('a', ''));

        await series.addListProvider(listProvider);
        const provider = new TestInfoProvider('Test');
        // Delay function
        provider.getFullInfoById = async () => new Promise<MultiProviderResult>((resolve) => {
            setTimeout(() => {
                resolve();
            }, DownloadSettings.REQUEST_TIMEOUT_IN_MS + 100);
        });
        await expect(downloadProviderLocalDataHelper.downloadProviderLocalData(series, provider)).rejects.toEqual(FailedRequestError.Timeout);
    }, DownloadSettings.REQUEST_TIMEOUT_IN_MS + 1000);
});
