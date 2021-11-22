import AniDBHelper from '../../src/backend/api/information-providers/anidb/anidb-helper'
import AniDBProvider from '../../src/backend/api/information-providers/anidb/anidb-provider'
import AniListProvider from '../../src/backend/api/information-providers/anilist/anilist-provider'
import TraktProvider from '../../src/backend/api/information-providers/trakt/trakt-provider'
import MainListAdder from '../../src/backend/controller/main-list-manager/main-list-adder'
import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager'
import Season from '../../src/backend/controller/objects/meta/season'
import Series from '../../src/backend/controller/objects/series'
import ProviderDataListManager from '../../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-manager'
import { ListProviderLocalData } from '../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data'
import ProviderList from '../../src/backend/controller/provider-controller/provider-manager/provider-list'
import ProviderNameManager from '../../src/backend/controller/provider-controller/provider-manager/provider-name-manager'
import ProviderLocalDataWithSeasonInfo from '../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info'

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

    test('should get series and should map episodes right from Trakt (Gakusen Toshi Asterisk S1)', async () => {
        const provider = new ListProviderLocalData(97794, TraktProvider)

        const series = new Series()
        series.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(provider, new Season(1)))
        const adderInstance = new MainListAdder()

        // Test

        await adderInstance.addSeries(series)

        // Result checking
        const mainList = MainListManager.getMainList()
        expect(mainList.length).toBe(1)

        const resultSeries = mainList[0]

        const bindings = resultSeries.getListProvidersLocalDataInfosWithSeasonInfo()

        const aniListName = ProviderNameManager.getProviderName(AniListProvider)
        const aniListBinding = bindings.find(x => x.providerLocalData.provider === aniListName)
        expect(aniListBinding?.providerLocalData.provider).toBe(aniListName)
        expect(aniListBinding?.providerLocalData.id).toEqual(21131)

        const traktName = ProviderNameManager.getProviderName(TraktProvider)
        const traktBinding = bindings.find(x => x.providerLocalData.provider === traktName)
        expect(traktBinding?.providerLocalData.provider).toBe(traktName)
        expect(traktBinding?.providerLocalData.id).toBe(97794)
        expect(traktBinding?.seasonTarget?.seasonNumbers[0]).toBe(1)

        const epMappings = resultSeries.episodeBindingPools
        expect(epMappings.length).toBe(12)
        for (const epMapping of epMappings) {
            const anistListMapping = epMapping.bindedEpisodeMappings.find(
                x => x.provider === ProviderNameManager.getProviderName(AniListProvider)
            )
            const traktListMapping = epMapping.bindedEpisodeMappings.find(
                x => x.provider === ProviderNameManager.getProviderName(TraktProvider)
            )

            expect(anistListMapping).not.toBeUndefined()
            expect(traktListMapping).not.toBeUndefined()
            for (const ep of epMapping.bindedEpisodeMappings) {
                for (const ep2 of epMapping.bindedEpisodeMappings) {
                    expect(ep.episodeNumber).toEqual(ep2.episodeNumber)
                }
            }
        }
    }, 60000)

    test('should get series and should map episodes right from AniList (Gakusen Toshi Asterisk S2)', async () => {
        const provider = new ListProviderLocalData(21390, AniListProvider)

        const series = new Series()
        series.addProviderDatas(provider)
        const adderInstance = new MainListAdder()

        // Test

        await adderInstance.addSeries(series)

        // Result checking
        const mainList = MainListManager.getMainList()

        const resultSeries = mainList[0]

        const bindings = resultSeries.getListProvidersLocalDataInfosWithSeasonInfo()

        expect((await resultSeries.getSeason()).seasonNumbers[0]).toEqual(2)

        const aniListName = ProviderNameManager.getProviderName(AniListProvider)
        const aniListBinding = bindings.find(x => x.providerLocalData.provider === aniListName)
        expect(aniListBinding?.providerLocalData.provider).toBe(aniListName)
        expect(aniListBinding?.providerLocalData.id).toBe(21390)

        const traktName = ProviderNameManager.getProviderName(TraktProvider)
        const traktBinding = bindings.find(x => x.providerLocalData.provider === traktName)
        expect(traktBinding?.providerLocalData.provider).toBe(ProviderNameManager.getProviderName(TraktProvider))
        expect(traktBinding?.providerLocalData.id).toBe(97794)

        const epMappings = resultSeries.episodeBindingPools
        expect(epMappings.length).toBe(24)
        for (const epMapping of epMappings) {
            const stra = epMapping.bindedEpisodeMappings.find(x => x.provider === aniListName)
            expect(stra).not.toEqual(undefined)
        }
    }, 60000)
})
