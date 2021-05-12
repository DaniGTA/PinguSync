/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/require-await */
import AniListProvider from '../../../../src/backend/api/information-providers/anilist/anilist-provider';
import MultiProviderResult from '../../../../src/backend/api/provider/multi-provider-result';
import FailedProviderRequest from '../../../../src/backend/controller/objects/meta/failed-provider-request';
import { FailedRequestError } from '../../../../src/backend/controller/objects/meta/failed-request';
import Name from '../../../../src/backend/controller/objects/meta/name';
import Series from '../../../../src/backend/controller/objects/series';
import ProviderDataListManager from '../../../../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-manager';
import { ProviderInfoStatus } from '../../../../src/backend/controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status';
import { ListProviderLocalData } from '../../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import ProviderNameManager from '../../../../src/backend/controller/provider-controller/provider-manager/provider-name-manager';
import DownloadProviderLocalDataHelper from '../../../../src/backend/helpFunctions/provider/provider-info-downloader/download-provider-local-data-helper';
import DownloadProviderLocalDataToTargetHelper from '../../../../src/backend/helpFunctions/provider/provider-info-downloader/download-provider-local-data-to-target-helper';
import TestListProvider from '../../../controller/objects/testClass/testListProvider';
import TestListProvider2 from '../../../controller/objects/testClass/testListProvider2';
import TestListProvider3 from '../../../controller/objects/testClass/testListProvider3';
// tslint:disable: no-string-literal
describe('Download provider local data to target info status helper test (download-provider-local-data-to-target-helper.ts)', () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        ProviderDataListManager['providerDataList'] = [];
    });
    describe('Testing function: downloadProviderLocalDataUntilTarget()', () => {
        test('should upgrade', async () => {
            const instance = new DownloadProviderLocalDataToTargetHelper(new Series(), new TestListProvider(), ProviderInfoStatus.FULL_INFO);
            const mock = jest.spyOn(DownloadProviderLocalDataHelper, 'downloadProviderLocalData');

            const firstLocalData = new ListProviderLocalData(1, TestListProvider);
            firstLocalData.infoStatus = ProviderInfoStatus.BASIC_INFO;


            const secondLocalData = new ListProviderLocalData(1, TestListProvider);
            secondLocalData.infoStatus = ProviderInfoStatus.FULL_INFO;

            mock.mockImplementationOnce(async () => new MultiProviderResult(firstLocalData))
                .mockImplementationOnce(async () => new MultiProviderResult(secondLocalData));

            const result = await instance['downloadProviderLocalDataUntilTarget'](new Series());
            expect(result?.mainProvider?.providerLocalData).toEqual(secondLocalData);

            mock.mockRestore();
        });

        test('should stop upgrade on no progress', async () => {
            const instance = new DownloadProviderLocalDataToTargetHelper(new Series(), new TestListProvider(), ProviderInfoStatus.FULL_INFO);
            const mock = jest.spyOn(DownloadProviderLocalDataHelper, 'downloadProviderLocalData');

            const firstLocalData = new ListProviderLocalData(1, TestListProvider);
            firstLocalData.infoStatus = ProviderInfoStatus.BASIC_INFO;

            mock.mockImplementation(async () => new MultiProviderResult(firstLocalData));
            const result = await instance['downloadProviderLocalDataUntilTarget'](new Series());
            expect(result?.mainProvider?.providerLocalData).toBe(firstLocalData);
            expect(mock).toBeCalledTimes(2);
            mock.mockRestore();
        });
    });

    describe('Testing function: upgradToTarget()', () => {
        test('should return result from default request', async () => {
            const series = new Series();
            const pld2 = new ListProviderLocalData(5, TestListProvider);

            pld2.addSeriesName(new Name('Name', 'jp'));
            series.addListProvider(pld2);

            const provider = new TestListProvider();
            const target = ProviderInfoStatus.FULL_INFO;

            const instance = new DownloadProviderLocalDataToTargetHelper(series, provider, target);

            const result = await instance.upgradeToTarget();

            expect(((result as FailedProviderRequest)).error).toEqual(FailedRequestError.ProviderNoResult);
        });
    });

    describe('Testing function: getAvaibleProvidersThatCanProvideProviderId()', () => {
        test('should return 2 provider', () => {
            const providerInstance = new TestListProvider3();

            const pld1 = new ListProviderLocalData(1, TestListProvider);
            const pld2 = new ListProviderLocalData(2, TestListProvider2);
            const pld3 = new ListProviderLocalData(3, TestListProvider3);

            const externalProvider = new TestListProvider();

            const instance = new DownloadProviderLocalDataToTargetHelper(new Series(), externalProvider, ProviderInfoStatus.FULL_INFO);


            jest.spyOn(instance, 'canGetTargetIdFromCurrentProvider' as any).mockImplementation(() => true);
            jest.spyOn(ProviderList, 'getProviderInstanceByLocalData').mockImplementation(() => providerInstance);

            const result = instance['getAvaibleProvidersThatCanProvideProviderId']([pld1, pld2, pld3], externalProvider);

            expect(result.length).toEqual(2);
        });


        test('should return 1 provider', () => {
            const providerInstance = new TestListProvider();

            const pld1 = new ListProviderLocalData(1, TestListProvider);
            const pld2 = new ListProviderLocalData(2, TestListProvider2);
            const pld3 = new ListProviderLocalData(3, TestListProvider3);

            const externalProvider = new TestListProvider();

            const instance = new DownloadProviderLocalDataToTargetHelper(new Series(), externalProvider, ProviderInfoStatus.FULL_INFO);


            jest.spyOn(instance, 'canGetTargetIdFromCurrentProvider' as any).mockImplementation(() => true);
            jest.spyOn(ProviderList, 'getProviderInstanceByLocalData').mockImplementationOnce(() => providerInstance);

            const result = instance['getAvaibleProvidersThatCanProvideProviderId']([pld1, pld2, pld3], externalProvider);

            expect(result.length).toEqual(1);
        });
    });

    describe('Testing function: canGetTargetIdFromCurrentProvider()', () => {
        test('should be true', () => {
            const currentProvider = new TestListProvider();
            currentProvider['potentialSubProviders'] = [AniListProvider];

            jest.spyOn(ProviderList, 'getProviderInstanceByLocalData').mockImplementation(() => currentProvider);
            jest.spyOn(ProviderNameManager, 'getProviderName').mockImplementation(() => TestListProvider2.name);

            const currentProviderLocalData = new ListProviderLocalData(1, TestListProvider);
            const targetProvider = new TestListProvider2();

            const result = new DownloadProviderLocalDataToTargetHelper(new Series(), currentProvider, ProviderInfoStatus.FULL_INFO)['canGetTargetIdFromCurrentProvider'](currentProviderLocalData, targetProvider);
            expect(result).toBeTruthy();
        });

        test('should be false (no right entry)', () => {
            const currentProvider = new TestListProvider();
            currentProvider['potentialSubProviders'] = [AniListProvider];

            jest.spyOn(ProviderList, 'getProviderInstanceByLocalData').mockImplementation(() => currentProvider);
            jest.spyOn(ProviderNameManager, 'getProviderName').mockImplementation(() => 'test');

            const currentProviderLocalData = new ListProviderLocalData(1, TestListProvider);
            const targetProvider = new TestListProvider2();

            const result = new DownloadProviderLocalDataToTargetHelper(new Series(), currentProvider, ProviderInfoStatus.FULL_INFO)['canGetTargetIdFromCurrentProvider'](currentProviderLocalData, targetProvider);
            expect(result).toBeFalsy();
        });

        test('should be false (no entry)', () => {
            const currentProvider = new TestListProvider();
            currentProvider['potentialSubProviders'] = [];

            jest.spyOn(ProviderList, 'getProviderInstanceByLocalData').mockImplementation(() => currentProvider);
            jest.spyOn(ProviderNameManager, 'getProviderName').mockImplementation(() => 'test');

            const currentProviderLocalData = new ListProviderLocalData(1, TestListProvider);
            const targetProvider = new TestListProvider2();

            const result = new DownloadProviderLocalDataToTargetHelper(new Series(), currentProvider, ProviderInfoStatus.FULL_INFO)['canGetTargetIdFromCurrentProvider'](currentProviderLocalData, targetProvider);
            expect(result).toBeFalsy();
        });

        test('should be false (no provider name)', () => {
            const currentProvider = new TestListProvider();
            currentProvider['potentialSubProviders'] = [AniListProvider];

            jest.spyOn(ProviderList, 'getProviderInstanceByLocalData').mockImplementation(() => currentProvider);
            jest.spyOn(ProviderNameManager, 'getProviderName').mockImplementation(() => { throw new Error('testing error'); });

            const currentProviderLocalData = new ListProviderLocalData(1, TestListProvider);
            const targetProvider = new TestListProvider2();

            const result = new DownloadProviderLocalDataToTargetHelper(new Series(), currentProvider, ProviderInfoStatus.FULL_INFO)['canGetTargetIdFromCurrentProvider'](currentProviderLocalData, targetProvider);
            expect(result).toBeFalsy();
        });
    });
});
