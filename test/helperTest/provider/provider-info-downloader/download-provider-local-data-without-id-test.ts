import { FailedRequestError } from '../../../../src/backend/controller/objects/meta/failed-request';
import Name from '../../../../src/backend/controller/objects/meta/name';
import Series from '../../../../src/backend/controller/objects/series';
import ProviderDataListManager from '../../../../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-manager';
import DownloadProviderLocalDataWithoutId from '../../../../src/backend/helpFunctions/provider/provider-info-downloader/download-provider-local-data-without-id';
import TestProvider from '../../../controller/objects/testClass/testProvider';
function getListOfName(): Name[] {
    const names: Name[] = [];
    names.push(new Name('a', 'a'));
    names.push(new Name('b', 'a'));
    names.push(new Name('c', 'a'));
    names.push(new Name('d', 'a'));
    names.push(new Name('e', 'a'));
    names.push(new Name('f', 'a'));
    names.push(new Name('g', 'a'));
    names.push(new Name('h', 'a'));
    names.push(new Name('j', 'a'));
    names.push(new Name('k', 'a'));
    return names;
}

describe('Download provider local data without provider id', () => {
    beforeEach(() => {
        // tslint:disable: no-string-literal
        ProviderDataListManager['providerDataList'] = [];
    });

    describe('Test function: downloadProviderSeriesInfoBySeriesName()', () => {
        test('should call request twice', async () => {
            const instance = new DownloadProviderLocalDataWithoutId(new Series(), new TestProvider('test'));
            const spyedRequest = jest.spyOn(instance, 'getProviderLocalDataByName' as any);
            spyedRequest.mockImplementationOnce(async () => undefined);

            await expect(instance['downloadProviderSeriesInfoBySeriesName']([new Name('a', 'b'), new Name('c', 'b')]))
                .rejects.toEqual(FailedRequestError.ProviderNoResult);

            expect(spyedRequest).toHaveBeenCalledTimes(2);
            spyedRequest.mockRestore();
        });

        test('should throw no result on no result', async () => {
            const instance = new DownloadProviderLocalDataWithoutId(new Series(), new TestProvider('test'));
            await expect(instance['downloadProviderSeriesInfoBySeriesName']([])).rejects.toEqual(FailedRequestError.ProviderNoResult);
        });
    });

    test('should stop searching by naming (failing by no result)', async () => {
        const provider = new TestProvider('Test');
        jest.spyOn(provider, 'getMoreSeriesInfoByName').mockImplementation(async () => []);

        const series = new Series();

        const dpldwi = new DownloadProviderLocalDataWithoutId(series, provider);

        await expect(dpldwi['downloadProviderSeriesInfoBySeriesName'](getListOfName())).rejects.toEqual(FailedRequestError.ProviderNoResult);
    });


    test('should stop searching by naming (failing by error msg)', async () => {
        const provider = new TestProvider('Test');
        jest.spyOn(provider, 'getMoreSeriesInfoByName').mockImplementation(async () => { throw new Error('no result'); });

        const series = new Series();

        const dpldwi = new DownloadProviderLocalDataWithoutId(series, provider);

        await expect(dpldwi['downloadProviderSeriesInfoBySeriesName'](getListOfName())).rejects.toEqual(FailedRequestError.ProviderNoResult);
    });

    test('should stop searching by naming (failing by error id)', async () => {
        const provider = new TestProvider('Test');
        jest.spyOn(provider, 'getMoreSeriesInfoByName').mockImplementation(async () => { throw FailedRequestError.ProviderNoResult; });

        const series = new Series();

        const dpldwi = new DownloadProviderLocalDataWithoutId(series, provider);

        await expect(dpldwi['downloadProviderSeriesInfoBySeriesName'](getListOfName())).rejects.toEqual(FailedRequestError.ProviderNoResult);
    });

    test('should stop searching by naming (failing by blocked provider)', async () => {
        const provider = new TestProvider('Test');
        const spyedFunction = jest.spyOn(provider, 'getMoreSeriesInfoByName');
        spyedFunction.mockImplementation(async () => { throw FailedRequestError.ProviderNotAvailble; });
        const series = new Series();

        const dpldwi = new DownloadProviderLocalDataWithoutId(series, provider);
        await expect(dpldwi['downloadProviderSeriesInfoBySeriesName'](getListOfName())).rejects.toEqual(FailedRequestError.ProviderNotAvailble);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(provider.getMoreSeriesInfoByName).toHaveBeenCalledTimes(1);
    });
});
