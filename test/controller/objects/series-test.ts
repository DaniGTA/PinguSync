import Episode from '../../../src/backend/controller/objects/meta/episode/episode'
import EpisodeBindingPool from '../../../src/backend/controller/objects/meta/episode/episode-binding-pool'
import EpisodeMapping from '../../../src/backend/controller/objects/meta/episode/episode-mapping'
import Name from '../../../src/backend/controller/objects/meta/name'
import { NameType } from '../../../src/backend/controller/objects/meta/name-type'
import Season from '../../../src/backend/controller/objects/meta/season'
import Series from '../../../src/backend/controller/objects/series'
import { InfoProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data'
import { ListProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data'
import ProviderDataWithSeasonInfo from '../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info'
import { SeasonSearchMode } from '../../../src/backend/helpFunctions/season-helper/season-search-mode'
import TestInfoProvider from './testClass/testInfoProvider'
import TestListProvider from './testClass/testListProvider'
import TestListProvider2 from './testClass/testListProvider2'

describe('Series | Basic', () => {
    test('should have a id', () => {
        const series = new Series()
        expect(series.id.length).not.toBe(0)
        return
    })

    test('should all episodes (1/3)', () => {
        const series = new Series()
        const providerA = new ListProviderLocalData(1, TestListProvider)
        providerA.episodes = 10
        const providerB = new ListProviderLocalData(1, TestListProvider2)
        providerB.episodes = 11
        series.addProviderDatas(providerA, providerB)
        const allEpisodes = series.getAllEpisodes()
        expect(allEpisodes[0]).toBe(10)
        expect(allEpisodes[1]).toBe(11)
        expect(allEpisodes.length).toBe(2)
        return
    })

    test('should all episodes (2/3)', () => {
        const series = new Series()
        const providerA = new ListProviderLocalData(1, TestListProvider)
        providerA.episodes = 10
        const providerB = new ListProviderLocalData(1, TestListProvider2)
        providerB.episodes = 11
        series.addProviderDatas(providerA, providerB)
        expect(series.getAllEpisodes()).toStrictEqual([10, 11])
    })

    test('should all episodes (3/3)', () => {
        const series = new Series()
        const providerA = new ListProviderLocalData(1)

        series.addListProvider(providerA)
        expect(series.getAllEpisodes()).toStrictEqual([])
    })

    test('should max episode (1/3)', () => {
        const series = new Series()
        const providerA = new ListProviderLocalData(1, TestListProvider)
        providerA.episodes = 12
        const providerB = new ListProviderLocalData(1, TestListProvider2)
        providerB.episodes = 11
        series.addProviderDatas(providerA, providerB)
        expect(series.getMaxEpisode()).toBe(12)
        return
    })

    test('should max episode (2/3)', () => {
        const series = new Series()
        const providerA = new ListProviderLocalData(1, TestListProvider)
        providerA.episodes = 12
        const providerB = new ListProviderLocalData(1, TestListProvider2)
        providerB.episodes = 24
        series.addProviderDatas(providerA, providerB)
        expect(series.getMaxEpisode()).toBe(24)
        return
    })

    test('should prevent duplicates in names', () => {
        const series = new Series()
        const providerA = new ListProviderLocalData(1)
        providerA.addSeriesName(new Name('Test', 'eng'))
        providerA.addSeriesName(new Name('Test', 'eng'))
        series.addListProvider(providerA)
        expect(series.getAllNames().length).toBe(1)
    })

    test('should prevent null entrys in names', () => {
        const series = new Series()
        const providerA = new ListProviderLocalData(1)
        providerA.addSeriesName((null as unknown) as Name)
        series.addListProvider(providerA)
        expect(series.getAllNames().length).toBe(0)
    })

    test('should prevent undefined entrys in names', () => {
        const series = new Series()
        const providerA = new ListProviderLocalData(1)
        providerA.addSeriesName((undefined as unknown) as Name)
        series.addListProvider(providerA)
        expect(series.getAllNames().length).toBe(0)
    })

    test('should replace existing info provider binding', () => {
        const series = new Series()
        const provider1 = new InfoProviderLocalData(1, TestInfoProvider)
        const provider2 = new InfoProviderLocalData(2, TestInfoProvider)

        series.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(provider1, new Season([3])))
        series.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(provider2, new Season([3])))

        expect(series.getAllProviderBindings()[0].id).toBe(2)
    })

    test('should extract season number from series', async () => {
        const series = new Series()
        const provider = new ListProviderLocalData(-1, TestListProvider)
        provider.addSeriesName(new Name('title-2nd-season', 'slug', NameType.SLUG))
        series.addProviderDatas(provider)
        const season = series.getSeason(SeasonSearchMode.NO_EXTRA_TRACE_REQUESTS)
        expect((await season).getSingleSeasonNumberAsNumber()).toBe(2)
    })

    test('should add episode binding', () => {
        const series = new Series()
        series.addEpisodeMapping(new EpisodeMapping(new Episode(1), new ListProviderLocalData(-1, TestListProvider)))
        expect(series.getEpisodeBindingPools().length).toBe(1)
    })

    test('should add episode binding (prevent duplicates)', () => {
        const series = new Series()
        const mapping = new EpisodeMapping(new Episode(1), new ListProviderLocalData(-1, TestListProvider))
        series.addEpisodeMapping(mapping)
        series.addEpisodeMapping(mapping)
        expect(series.getEpisodeBindingPools().length).toBe(1)
    })

    test('should update episode binding (first mapping, second binding)', () => {
        const series = new Series()
        const mapping = new EpisodeMapping(new Episode(1), new ListProviderLocalData(-1, TestListProvider))
        const pool = new EpisodeBindingPool(
            mapping,
            new EpisodeMapping(new Episode(1), new ListProviderLocalData(-1, TestListProvider2))
        )

        series.addEpisodeMapping(mapping)
        series.addEpisodeBindingPools(pool)

        const bindingPools = series.getEpisodeBindingPools()
        expect(bindingPools.length).toBe(1)
        expect(bindingPools[0].bindedEpisodeMappings.length).toBe(2)
    })

    test('should update episode binding (first binding, second mapping)', () => {
        const series = new Series()
        const mapping = new EpisodeMapping(new Episode(1), new ListProviderLocalData(-1, TestListProvider))
        const pool = new EpisodeBindingPool(
            mapping,
            new EpisodeMapping(new Episode(1), new ListProviderLocalData(-1, TestListProvider2))
        )

        series.addEpisodeBindingPools(pool)
        series.addEpisodeMapping(mapping)

        const bindingPools = series.getEpisodeBindingPools()
        expect(bindingPools.length).toBe(1)
        expect(bindingPools[0].bindedEpisodeMappings.length).toBe(2)
    })
})
