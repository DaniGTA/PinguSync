/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/require-await */
import MultiProviderResult from '../../../../src/backend/api/provider/multi-provider-result'
import { FailedRequestError } from '../../../../src/backend/controller/objects/meta/failed-request'
import Name from '../../../../src/backend/controller/objects/meta/name'
import Series from '../../../../src/backend/controller/objects/series'
import ProviderDataListManager from '../../../../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-manager'
import { ListProviderLocalData } from '../../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data'
import ProviderList from '../../../../src/backend/controller/provider-controller/provider-manager/provider-list'
import downloadProviderLocalDataHelper from '../../../../src/backend/helpFunctions/provider/provider-info-downloader/download-provider-local-data-helper'
import DownloadSettings from '../../../../src/backend/helpFunctions/provider/provider-info-downloader/download-settings'
import ProviderLocalDataWithSeasonInfo from '../../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info'
import TestInfoProvider from '../../../controller/objects/testClass/testInfoProvider'
import TestListProvider from '../../../controller/objects/testClass/testListProvider'
import TestListProvider2 from '../../../controller/objects/testClass/testListProvider2'

// tslint:disable: no-string-literal
describe('Provider local data downloader tests (download-provider-local-data-helper.ts)', () => {
    beforeEach(() => {
        ProviderDataListManager['providerDataList'] = []
    })

    test('should download provider local data (no id)', async () => {
        ProviderList['loadedListProvider'] = [new TestListProvider2(false, true)]
        const series = new Series()

        const listProvider = new ListProviderLocalData(1, TestListProvider2)
        listProvider.addSeriesName(new Name('a', ''))

        series.addListProvider(listProvider)
        const provider = new TestInfoProvider()

        const resultListProvider = new ListProviderLocalData(1, TestListProvider)
        resultListProvider.addSeriesName(new Name('a', ''))

        jest.spyOn(provider, 'getMoreSeriesInfoByName').mockImplementation(async () => [
            new MultiProviderResult(new ProviderLocalDataWithSeasonInfo(resultListProvider)),
        ])

        const a = await downloadProviderLocalDataHelper.downloadProviderLocalData(series, provider)

        expect(a.mainProvider.providerLocalData.id).toEqual(1)
    })

    test('should dont have a result (no id)', async () => {
        // tslint:disable: no-string-literal
        ProviderList['loadedListProvider'] = [new TestListProvider2(false, true)]
        const series = new Series()

        const listProvider = new ListProviderLocalData(1, TestListProvider2)
        listProvider.addSeriesName(new Name('a', ''))

        series.addListProvider(listProvider)
        const provider = new TestInfoProvider()

        const resultListProvider = new ListProviderLocalData(1, TestListProvider)

        jest.spyOn(provider, 'getMoreSeriesInfoByName').mockImplementation(async () => [
            new MultiProviderResult(new ProviderLocalDataWithSeasonInfo(resultListProvider)),
        ])
        await expect(
            async () => await downloadProviderLocalDataHelper.downloadProviderLocalData(series, provider)
        ).rejects.toBe(FailedRequestError.ProviderNoResult)
    })

    test('should say that provider is not avaible (no id)', async () => {
        // tslint:disable: no-string-literal
        ProviderList['loadedListProvider'] = [new TestListProvider(false, true)]
        const series = new Series()

        const listProvider = new ListProviderLocalData(1, TestListProvider2)
        listProvider.addSeriesName(new Name('a', ''))

        series.addListProvider(listProvider)
        const provider = new TestInfoProvider()
        provider.isProviderAvailable = async (): Promise<boolean> => false
        await expect(
            async () => await downloadProviderLocalDataHelper.downloadProviderLocalData(series, provider)
        ).rejects.toBe(FailedRequestError.ProviderNotAvailble)
    })

    describe('timeout', () => {
        let spy: jest.SpyInstance<any, unknown[]>
        beforeAll(() => {
            spy = jest.spyOn(DownloadSettings, 'requestTimoutPromise' as any).mockImplementation(async () => {
                return new Promise<void>((resolve, reject) =>
                    setTimeout(() => {
                        reject(FailedRequestError.Timeout)
                    }, 100)
                )
            })
        })

        afterAll(() => {
            spy?.mockClear()
        })

        test('should timeout (no id)', async () => {
            // tslint:disable: no-string-literal
            ProviderList['loadedListProvider'] = [new TestListProvider2(false, true)]
            const series = new Series()

            const listProvider = new ListProviderLocalData(1, TestListProvider2)
            listProvider.addSeriesName(new Name('a', ''))

            series.addListProvider(listProvider)
            const provider = new TestInfoProvider()
            // Delay function
            provider.getMoreSeriesInfoByName = async (): Promise<MultiProviderResult[]> =>
                new Promise<MultiProviderResult[]>(resolve => {
                    setTimeout(() => {
                        resolve([])
                    }, 101)
                })
            await expect(downloadProviderLocalDataHelper.downloadProviderLocalData(series, provider)).rejects.toEqual(
                FailedRequestError.Timeout
            )
        })
    })

    test('should dont have a result (with id)', async () => {
        // tslint:disable: no-string-literal
        ProviderList['loadedListProvider'] = [new TestListProvider(false, true)]
        const series = new Series()

        const listProvider = new ListProviderLocalData(1)
        listProvider.addSeriesName(new Name('a', ''))

        series.addListProvider(listProvider)
        const provider = new TestInfoProvider()
        jest.spyOn(provider, 'getFullInfoById').mockImplementation(
            async (): Promise<MultiProviderResult> => {
                throw new Error('no result')
            }
        )
        await expect(
            async () => await downloadProviderLocalDataHelper.downloadProviderLocalData(series, provider)
        ).rejects.toBe(FailedRequestError.ProviderNoResult)
    })

    test('should say that provider is not avaible (with id)', async () => {
        // tslint:disable: no-string-literal
        ProviderList['loadedListProvider'] = [new TestListProvider(false, true)]
        const series = new Series()

        const listProvider = new ListProviderLocalData(1, TestListProvider)
        listProvider.addSeriesName(new Name('a', ''))

        series.addListProvider(listProvider)
        const provider = new TestInfoProvider()
        jest.spyOn(provider, 'isProviderAvailable').mockImplementation(async (): Promise<boolean> => false)
        await expect(downloadProviderLocalDataHelper.downloadProviderLocalData(series, provider)).rejects.toEqual(
            FailedRequestError.ProviderNotAvailble
        )
    })

    test(
        'should timeout (with id)',
        async () => {
            // tslint:disable: no-string-literal
            ProviderList['loadedListProvider'] = [new TestListProvider(false, true)]
            const series = new Series()

            const listProvider = new ListProviderLocalData(1, TestListProvider)
            listProvider.addSeriesName(new Name('a', ''))

            series.addListProvider(listProvider)
            const provider = new TestListProvider()
            // Delay function
            provider.getFullInfoById = async (): Promise<MultiProviderResult> =>
                new Promise<MultiProviderResult>(resolve => {
                    setTimeout(() => {
                        resolve(undefined as any)
                    }, DownloadSettings.REQUEST_TIMEOUT_IN_MS + 50)
                })
            await expect(downloadProviderLocalDataHelper.downloadProviderLocalData(series, provider)).rejects.toEqual(
                FailedRequestError.Timeout
            )
        },
        DownloadSettings.REQUEST_TIMEOUT_IN_MS + 100
    )
})
