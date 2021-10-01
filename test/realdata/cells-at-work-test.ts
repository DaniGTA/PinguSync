import AniDBHelper from '../../src/backend/api/information-providers/anidb/anidb-helper'
import AniDBProvider from '../../src/backend/api/information-providers/anidb/anidb-provider'
import AniListProvider from '../../src/backend/api/information-providers/anilist/anilist-provider'
import TraktProvider from '../../src/backend/api/information-providers/trakt/trakt-provider'
import ListController from '../../src/backend/controller/list-controller'
import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager'
import MainListSearcher from '../../src/backend/controller/main-list-manager/main-list-searcher'
import Series from '../../src/backend/controller/objects/series'
import ProviderDataListManager from '../../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-manager'
import { ProviderInfoStatus } from '../../src/backend/controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status'
import { ListProviderLocalData } from '../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data'
import ProviderList from '../../src/backend/controller/provider-controller/provider-manager/provider-list'
import ProviderNameManager from '../../src/backend/controller/provider-controller/provider-manager/provider-name-manager'

describe('Cells at Work | Testrun', () => {
    beforeAll(() => {
        const anilistInstance = ProviderList.getProviderInstanceByClass(AniListProvider)
        if (!anilistInstance) {
            throw new Error()
        }
        jest.spyOn(anilistInstance, 'isUserLoggedIn').mockImplementation(async () => true)
        const traktInstance = ProviderList.getProviderInstanceByClass(TraktProvider)
        if (!traktInstance) {
            throw new Error()
        }
        jest.spyOn(traktInstance, 'isUserLoggedIn').mockImplementation(async () => true)
        const anidbNameManagerInstance = AniDBHelper['anidbNameManager']
        anidbNameManagerInstance.data = new AniDBProvider()['convertXmlToJson']()
    })

    beforeEach(() => {
        MainListManager['mainList'] = []
        ProviderDataListManager['providerDataList'] = []
    })

    test('should process the anime Cells at Work right (anilist source)', async () => {
        const series = new Series()
        const provider = new ListProviderLocalData(108631, AniListProvider)
        provider.infoStatus = ProviderInfoStatus.ONLY_ID
        series.addListProvider(provider)

        await ListController.instance?.addSeriesToMainList(series)
        const anilistName = ProviderNameManager.getProviderName(AniListProvider)
        const traktName = ProviderNameManager.getProviderName(TraktProvider)
        const resultSeries = MainListSearcher.findAllSeriesByProvider(108631, anilistName)
        expect(resultSeries.length).toBe(1)
        const mappingPool = await resultSeries[0].getEpisodeMapping()
        expect(mappingPool.length).not.toBe(0)
        for (const pool of mappingPool) {
            expect(pool.isBindingPoolHaveThisProvider(anilistName)).toBeTruthy()
            expect(pool.isBindingPoolHaveThisProvider(traktName)).toBeTruthy()
        }
    }, 130000)

    test('should process the anime Cells at Work right (Trakt source)', async () => {
        const series = new Series()
        const provider = new ListProviderLocalData(130155, TraktProvider)
        provider.infoStatus = ProviderInfoStatus.ONLY_ID
        series.addListProvider(provider)

        await ListController.instance?.addSeriesToMainList(series)
        const anilistName = ProviderNameManager.getProviderName(AniListProvider)
        const traktName = ProviderNameManager.getProviderName(TraktProvider)
        const resultSeries = MainListSearcher.findAllSeriesByProvider(130155, traktName)
        expect(resultSeries.length).toBe(3)
        const mapping = await resultSeries[0].getEpisodeMapping()
        expect(mapping.length).not.toBe(0)
        for (const pool of mapping) {
            expect(pool.isBindingPoolHaveThisProvider(anilistName)).toBeTruthy()
            expect(pool.isBindingPoolHaveThisProvider(traktName)).toBeTruthy()
        }
    }, 600000)
})
