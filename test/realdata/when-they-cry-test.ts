import AniDBHelper from '../../src/backend/api/information-providers/anidb/anidb-helper'
import AniDBProvider from '../../src/backend/api/information-providers/anidb/anidb-provider'
import AniListProvider from '../../src/backend/api/information-providers/anilist/anilist-provider'
import TraktProvider from '../../src/backend/api/information-providers/trakt/trakt-provider'
import MainListAdder from '../../src/backend/controller/main-list-manager/main-list-adder'
import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager'
import Series from '../../src/backend/controller/objects/series'
import ProviderDataListManager from '../../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-manager'
import { ListProviderLocalData } from '../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data'
import ProviderList from '../../src/backend/controller/provider-controller/provider-manager/provider-list'
import ProviderNameManager from '../../src/backend/controller/provider-controller/provider-manager/provider-name-manager'

describe('Gakusen Toshi Asterisk | Testrun', () => {
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

    test('should get series and should map episodes right (Series: When they Cry)', async () => {
        const provider = new ListProviderLocalData(61179, TraktProvider)

        const series = new Series()
        series.addProviderDatas(provider)
        const adderInstance = new MainListAdder()

        // Test

        await adderInstance.addSeries(series)

        // Result checking
        const mainList = MainListManager.getMainList()

        const resultSeries = mainList[0]

        const bindings = resultSeries.getListProvidersLocalDataInfosWithSeasonInfo()

        const aniListName = ProviderNameManager.getProviderName(AniListProvider)
        const aniListBinding = bindings.find(x => x.providerLocalData.provider === aniListName)
        expect(aniListBinding?.providerLocalData.provider).toBe(aniListName)
        expect(aniListBinding?.providerLocalData.id).toEqual(934)

        const traktName = ProviderNameManager.getProviderName(TraktProvider)
        const traktBinding = bindings.find(x => x.providerLocalData.provider === traktName)
        expect(traktBinding?.providerLocalData.provider).toBe(traktName)
        expect(traktBinding?.providerLocalData.id).toBe(61179)

        const epMappings = resultSeries.episodeBindingPools
        for (const epMapping of epMappings) {
            const relevantResult = epMapping.bindedEpisodeMappings.find(
                x => x.provider === ProviderNameManager.getProviderName(AniListProvider)
            )
            expect(relevantResult).not.toBe(undefined)
            for (const ep of epMapping.bindedEpisodeMappings) {
                for (const ep2 of epMapping.bindedEpisodeMappings) {
                    expect(ep.episodeNumber).toEqual(ep2.episodeNumber)
                }
            }
        }
    }, 40000)
})