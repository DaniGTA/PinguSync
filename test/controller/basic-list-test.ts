/* eslint-disable @typescript-eslint/require-await */
import AniDBHelper from '../../src/backend/api/information-providers/anidb/anidb-helper'
import AniDBProvider from '../../src/backend/api/information-providers/anidb/anidb-provider'
import AniListProvider from '../../src/backend/api/information-providers/anilist/anilist-provider'
import TraktProvider from '../../src/backend/api/information-providers/trakt/trakt-provider'
import TVDBProvider from '../../src/backend/api/information-providers/tvdb/tvdb-provider'
import TVMazeProvider from '../../src/backend/api/information-providers/tvmaze/tvmaze-provider'
import ImdbProvider from '../../src/backend/api/information-providers/imdb/imdb-provider'
import TmdbProvider from '../../src/backend/api/information-providers/tmdb/tmdb-provider'
import MultiProviderResult from '../../src/backend/api/provider/multi-provider-result'
import ListController from '../../src/backend/controller/list-controller'
import MainListAdder from '../../src/backend/controller/main-list-manager/main-list-adder'
import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager'
import MainListSearcher from '../../src/backend/controller/main-list-manager/main-list-searcher'
import { EpisodeType } from '../../src/backend/controller/objects/meta/episode/episode-type'
import Name from '../../src/backend/controller/objects/meta/name'
import { NameType } from '../../src/backend/controller/objects/meta/name-type'
import Season from '../../src/backend/controller/objects/meta/season'
import Series from '../../src/backend/controller/objects/series'
import ProviderDataListManager from '../../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-manager'
import { InfoProviderLocalData } from '../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data'
import { ProviderInfoStatus } from '../../src/backend/controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status'
import { ListProviderLocalData } from '../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data'
import ProviderList from '../../src/backend/controller/provider-controller/provider-manager/provider-list'
import ProviderNameManager from '../../src/backend/controller/provider-controller/provider-manager/provider-name-manager'
import EpisodeBindingPoolHelper from '../../src/backend/helpFunctions/episode-binding-pool-helper'
import DownloadProviderLocalDataWithoutId from '../../src/backend/helpFunctions/provider/provider-info-downloader/download-provider-local-data-without-id'
import ProviderLocalDataWithSeasonInfo from '../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info'
import seriesHelper from '../../src/backend/helpFunctions/series-helper'
import logger from '../../src/backend/logger/logger'
// tslint:disable: no-string-literal
describe('Basic List | Testrun', () => {
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

    test('should find other provider and mapping them.', async () => {
        if (!ListController.instance) {
            throw new Error()
        }
        const series = new Series()
        const provider = new ListProviderLocalData(101348, AniListProvider)
        provider.infoStatus = ProviderInfoStatus.ONLY_ID
        series.addListProvider(provider)

        await ListController.instance.addSeriesToMainList(series)

        // tslint:disable-next-line: no-string-literal
        expect(MainListManager['mainList'].length).toBe(1)

        // tslint:disable-next-line: no-string-literal
        const updatedProviders = MainListManager['mainList'][0].getAllProviderLocalDatas()

        // provider should got been updated

        const anilistResult = updatedProviders.find(x => x.provider === AniListProvider.getInstance().providerName)
        const traktResult = updatedProviders.find(x => x.provider === TraktProvider.getInstance().providerName)
        if (anilistResult && traktResult) {
            expect(anilistResult.getDetailEpisodeInfos().length).not.toEqual(0)
            expect(traktResult.getDetailEpisodeInfos().length).not.toEqual(0)
            expect(anilistResult.getAllNames().length).not.toEqual(0)
            expect(traktResult.getAllNames().length).not.toEqual(0)
            expect(traktResult.version).toEqual(ProviderInfoStatus.ADVANCED_BASIC_INFO)
            expect(anilistResult.version).toEqual(ProviderInfoStatus.ADVANCED_BASIC_INFO)
        } else {
            throw new Error()
        }
    }, 8000)

    test('should find other provider and mapping two season together.', async () => {
        if (!ListController.instance) {
            throw new Error()
        }
        // S1
        const series = new Series()
        const provider = new ListProviderLocalData(21202, AniListProvider)
        provider.infoStatus = ProviderInfoStatus.ONLY_ID
        series.addListProvider(provider)

        await ListController.instance.addSeriesToMainList(series)

        // S2
        const series2 = new Series()
        const provider2 = new ListProviderLocalData(21699, AniListProvider)
        provider2.infoStatus = ProviderInfoStatus.ONLY_ID
        series2.addListProvider(provider2)

        await ListController.instance.addSeriesToMainList(series2)

        // tslint:disable-next-line: no-string-literal
        expect(MainListManager['mainList'].length).toBe(2)

        // tslint:disable-next-line: no-string-literal
        const updatedProviders = MainListManager['mainList'][0].getAllProviderLocalDatas()
        // tslint:disable-next-line: no-string-literal
        const updatedSeries2 = MainListManager['mainList'][1]
        const updatedProviders2 = updatedSeries2.getAllProviderLocalDatas()
        // provider should got been updated

        const anilistResult = updatedProviders.find(x => x.provider === AniListProvider.getInstance().providerName)
        const traktResult = updatedProviders.find(x => x.provider === TraktProvider.getInstance().providerName)

        const anilistResult2 = updatedProviders2.find(x => x.provider === AniListProvider.getInstance().providerName)
        const traktResult2 = updatedProviders2.find(x => x.provider === TraktProvider.getInstance().providerName)
        if (anilistResult && traktResult && anilistResult2 && traktResult2) {
            expect(anilistResult.getDetailEpisodeInfos().length).not.toEqual(0)
            expect(traktResult.getDetailEpisodeInfos().length).not.toEqual(0)
            expect(anilistResult.getAllNames().length).not.toEqual(0)
            expect(traktResult.getAllNames().length).not.toEqual(0)
            expect(traktResult.version).toBe(ProviderInfoStatus.ADVANCED_BASIC_INFO)
            expect(anilistResult.version).toBe(ProviderInfoStatus.ADVANCED_BASIC_INFO)
            for (const anilistResultEntry of anilistResult.getDetailEpisodeInfos()) {
                expect(
                    EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(
                        series.episodeBindingPools,
                        anilistResultEntry
                    )[0].episodeNumber
                ).toBe(anilistResultEntry.episodeNumber)
            }
            for (const anilistResult2Entry of anilistResult2.getDetailEpisodeInfos()) {
                const result = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(
                    updatedSeries2.episodeBindingPools,
                    anilistResult2Entry
                )
                expect(result[0].episodeNumber).toBe(anilistResult2Entry.episodeNumber)
            }
            for (const trakt of traktResult2.getDetailEpisodeInfos()) {
                if (trakt.type === EpisodeType.SPECIAL) {
                    const r = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(series2.episodeBindingPools, trakt)
                    expect(r.length).toBe(0)
                } else {
                    if (trakt?.season?.getSingleSeasonNumberAsNumber() === 2) {
                        const r = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(
                            series2.episodeBindingPools,
                            trakt
                        )
                        expect(r.length).not.toBe(0)
                        expect(r[0].episodeNumber).toBe(trakt.episodeNumber)
                    }
                }
            }
        } else {
            throw new Error()
        }
    }, 8000)

    test('should not merge them together', async () => {
        if (!ListController.instance) {
            throw new Error()
        }

        // S1
        const series1 = new Series()
        const s1provider2 = new ListProviderLocalData(20920, AniListProvider)
        s1provider2.infoStatus = ProviderInfoStatus.ONLY_ID
        const s1provider3 = new ListProviderLocalData(94090, TraktProvider)
        s1provider3.infoStatus = ProviderInfoStatus.ONLY_ID
        const s1provider5 = new InfoProviderLocalData(289882, TVDBProvider)
        s1provider5.infoStatus = ProviderInfoStatus.ONLY_ID
        const s1provider6 = new InfoProviderLocalData('tt4728568', ImdbProvider)
        s1provider6.infoStatus = ProviderInfoStatus.ONLY_ID
        const s1provider7 = new InfoProviderLocalData(62745, TmdbProvider)
        s1provider7.infoStatus = ProviderInfoStatus.ONLY_ID
        const s1provider8 = new InfoProviderLocalData(5312, TVMazeProvider)
        s1provider8.infoStatus = ProviderInfoStatus.ONLY_ID
        series1.addListProvider(s1provider2)
        series1.addListProvider(s1provider3)
        series1.addInfoProvider(s1provider5)
        series1.addInfoProvider(s1provider6)
        series1.addInfoProvider(s1provider7)

        await ListController.instance.addSeriesToMainList(series1)
        // S2
        const series2 = new Series()
        const s2provider2 = new ListProviderLocalData(101167, AniListProvider)
        s2provider2.infoStatus = ProviderInfoStatus.ONLY_ID
        const s2provider3 = new ListProviderLocalData(94090, TraktProvider)
        s2provider3.infoStatus = ProviderInfoStatus.ONLY_ID
        const s2provider5 = new InfoProviderLocalData(289882, TVDBProvider)
        s2provider5.infoStatus = ProviderInfoStatus.ONLY_ID
        const s2provider6 = new InfoProviderLocalData('tt4728568', ImdbProvider)
        s2provider6.infoStatus = ProviderInfoStatus.ONLY_ID
        const s2provider7 = new InfoProviderLocalData(62745, TmdbProvider)
        s2provider7.infoStatus = ProviderInfoStatus.ONLY_ID
        const s2provider8 = new InfoProviderLocalData(5312, TVMazeProvider)
        s2provider8.infoStatus = ProviderInfoStatus.ONLY_ID
        series2.addListProvider(s2provider2)
        series2.addListProvider(s2provider3)
        series2.addInfoProvider(s2provider5)
        series2.addInfoProvider(s2provider6)
        series2.addInfoProvider(s2provider7)

        await ListController.instance.addSeriesToMainList(series2)
        // tslint:disable-next-line: no-string-literal
        await MainListManager['finishListFilling']()
        // tslint:disable-next-line: no-string-literal
        expect(MainListManager['mainList'].length).toEqual(2)
        expect(await seriesHelper.isSameSeries(series1, series2)).toEqual(false)
    }, 8000)

    test('should not merge different animes', async () => {
        if (!ListController.instance) {
            throw new Error()
        }

        const series1 = new Series()
        const s1provider1 = new ListProviderLocalData(21858, AniListProvider)
        s1provider1.infoStatus = ProviderInfoStatus.ONLY_ID
        series1.addListProvider(s1provider1)

        const series2 = new Series()
        const s2provider1 = new ListProviderLocalData(21776, AniListProvider)
        s2provider1.infoStatus = ProviderInfoStatus.ONLY_ID
        series2.addListProvider(s2provider1)
        await ListController.instance.addSeriesToMainList(series1, series2)

        const series3 = new Series()
        const s3provider1 = new ListProviderLocalData(117492, TraktProvider)
        s3provider1.infoStatus = ProviderInfoStatus.ONLY_ID
        series3.addListProvider(s3provider1)

        await ListController.instance.addSeriesToMainList(series3)
        // tslint:disable-next-line: no-string-literal
        await MainListManager['finishListFilling']()
        // tslint:disable-next-line: no-string-literal
        expect(MainListManager['mainList'].length).toEqual(3)
        expect(await seriesHelper.isSameSeries(series1, series3)).toEqual(false)
        expect(await seriesHelper.isSameSeries(series2, series3)).toEqual(false)
    }, 4000)

    test('should not merge series with anime', async () => {
        if (!ListController.instance) {
            throw new Error()
        }

        const series1 = new Series()
        const s1provider1 = new ListProviderLocalData(108632, AniListProvider)
        s1provider1.infoStatus = ProviderInfoStatus.ONLY_ID
        const s1provider2 = new InfoProviderLocalData(11370, AniDBProvider)
        s1provider2.infoStatus = ProviderInfoStatus.ONLY_ID
        series1.addListProvider(s1provider1)
        series1.addInfoProvider(s1provider2)

        const series2 = new Series()
        const s2provider1 = new ListProviderLocalData(1390, TraktProvider)
        s2provider1.infoStatus = ProviderInfoStatus.ONLY_ID
        series2.addListProvider(s2provider1)
        await ListController.instance.addSeriesToMainList(series1, series2)
        // tslint:disable-next-line: no-string-literal
        await MainListManager['finishListFilling']()
        // tslint:disable-next-line: no-string-literal
        expect(MainListManager['mainList'].length).toEqual(2)
        expect(await seriesHelper.isSameSeries(series1, series2)).toEqual(false)
    }, 4000)

    test('should not merge season 1 with season 2', async () => {
        if (!ListController.instance) {
            throw new Error()
        }
        // s1
        const series1 = new Series()
        const s1provider1 = new ListProviderLocalData(8675, AniListProvider)
        s1provider1.infoStatus = ProviderInfoStatus.ONLY_ID
        series1.addListProvider(s1provider1)
        // s2
        const series2 = new Series()
        const s2provider1 = new ListProviderLocalData(20448, AniListProvider)
        s2provider1.infoStatus = ProviderInfoStatus.ONLY_ID
        series2.addListProvider(s2provider1)
        await ListController.instance.addSeriesToMainList(series1, series2)
        // tslint:disable-next-line: no-string-literal
        await MainListManager['finishListFilling']()
        // tslint:disable-next-line: no-string-literal
        expect(MainListManager['mainList'].length).toEqual(2)
        expect(await seriesHelper.isSameSeries(series1, series2)).toBe(false)
    }, 4000)

    test('should create only 2 series', async () => {
        if (!ListController.instance) {
            throw new Error()
        }
        // s1
        const series1 = new Series()
        const s1provider1 = new ListProviderLocalData(20853, AniListProvider)
        s1provider1.infoStatus = ProviderInfoStatus.ONLY_ID
        series1.addListProvider(s1provider1)
        // s2
        const series2 = new Series()
        const s2provider1 = new ListProviderLocalData(20632, AniListProvider)
        s2provider1.infoStatus = ProviderInfoStatus.ONLY_ID
        series2.addListProvider(s2provider1)

        const series3 = new Series()
        const s3provider1 = new ListProviderLocalData(20853, AniListProvider)
        s3provider1.infoStatus = ProviderInfoStatus.ONLY_ID
        series3.addListProvider(s3provider1)

        await ListController.instance.addSeriesToMainList(series1, series2, series3)

        // tslint:disable-next-line: no-string-literal
        await MainListManager['finishListFilling']()
        // tslint:disable-next-line: no-string-literal
        expect(MainListManager['mainList'].length).toEqual(2)
    }, 4000)

    // TODO SPEED UP TEST (THIS TEST TAKES 1 MINUTE)
    test('should not create too much detailed episodes', async () => {
        if (!ListController.instance) {
            throw new Error()
        }
        // s1
        const series1 = new Series()
        const s1provider1 = new ListProviderLocalData(46004, TraktProvider)
        s1provider1.infoStatus = ProviderInfoStatus.ONLY_ID
        series1.addListProvider(s1provider1)

        await ListController.instance.addSeriesToMainList(series1)

        // tslint:disable-next-line: no-string-literal
        await MainListManager['finishListFilling']()
        const series = MainListSearcher.findAllSeriesByProvider(
            46004,
            ProviderList.getProviderInstanceByClass(TraktProvider).providerName
        )[0]
        // tslint:disable-next-line: no-string-literal
        const provider = series
            .getAllProviderLocalDatas()
            .find(x => x.provider === TraktProvider.getInstance().providerName)
        if (provider != null) {
            for (const iterator of provider.getDetailEpisodeInfos()) {
                logger.warn(iterator.episodeNumber + ' S: ' + iterator.season)
            }
            expect(provider.getDetailEpisodeInfos().length).toEqual(341)
        } else {
            throw new Error()
        }
    }, 4000)

    test('should update anilist series (20605)', async () => {
        if (!ListController.instance) {
            throw new Error()
        }
        // s1
        const series1 = new Series()
        const s1provider1 = new ListProviderLocalData(20605, AniListProvider)
        s1provider1.infoStatus = ProviderInfoStatus.ONLY_ID
        series1.addListProvider(s1provider1)

        await ListController.instance.addSeriesToMainList(series1)

        // tslint:disable-next-line: no-string-literal
        await MainListManager['finishListFilling']()
        // tslint:disable-next-line: no-string-literal
        const mpr = new MultiProviderResult(s1provider1)
        const result = MainListSearcher['findSeriesWithMultiProviderResult'](mpr)

        expect(result).not.toBeNull()
    }, 4000)

    test('should not get season 1 on season 2', async () => {
        if (!ListController.instance) {
            throw new Error()
        }
        // s1
        const series1 = new Series()
        const s1provider1 = new ListProviderLocalData(20521, AniListProvider)
        s1provider1.infoStatus = ProviderInfoStatus.ONLY_ID
        series1.addListProvider(s1provider1)

        // s2
        const series2 = new Series()
        series2.id = 'S2'
        const s2provider1 = new ListProviderLocalData(20711, AniListProvider)
        s2provider1.infoStatus = ProviderInfoStatus.ONLY_ID
        series2.addListProvider(s2provider1)

        // s3
        const series3 = new Series()
        const s3provider1 = new ListProviderLocalData(60931, TraktProvider)
        s3provider1.infoStatus = ProviderInfoStatus.ONLY_ID
        series3.addListProvider(s3provider1)

        await ListController.instance.addSeriesToMainList(series2, series1, series3)

        // tslint:disable-next-line: no-string-literal
        await MainListManager['finishListFilling']()
        // tslint:disable-next-line: no-string-literal
        const mpr1 = new MultiProviderResult(s1provider1)
        const mpr2 = new MultiProviderResult(s2provider1)
        const resultS1 = MainListSearcher['findSeriesWithMultiProviderResult'](mpr1)
        const resultS2 = MainListSearcher['findSeriesWithMultiProviderResult'](mpr2)
        if (resultS1 && resultS2) {
            const traktProviderS1 = resultS1
                .getAllProviderLocalDatas()
                .find(x => x.provider === TraktProvider.getInstance().providerName)
            const traktProviderS2 = resultS2
                .getAllProviderLocalDatas()
                .find(x => x.provider === TraktProvider.getInstance().providerName)
            if (traktProviderS1 && traktProviderS2) {
                expect(
                    resultS1.getProviderSeasonTarget(traktProviderS1.provider)?.getSingleSeasonNumberAsNumber()
                ).toEqual(1)
                expect(
                    resultS2.getProviderSeasonTarget(traktProviderS2.provider)?.getSingleSeasonNumberAsNumber()
                ).toEqual(2)
            } else {
                throw new Error()
            }
        } else {
            throw new Error()
        }
    }, 4000)

    test('should get trakt info data on all seasons', async () => {
        if (!ListController.instance) {
            throw new Error()
        }
        // s1
        const series1 = new Series()
        const s1provider1 = new ListProviderLocalData(20994, AniListProvider)
        s1provider1.infoStatus = ProviderInfoStatus.ONLY_ID
        series1.addListProvider(s1provider1)

        // s2
        const series2 = new Series()
        const s2provider1 = new ListProviderLocalData(21364, AniListProvider)
        s2provider1.infoStatus = ProviderInfoStatus.ONLY_ID
        series2.addListProvider(s2provider1)

        await ListController.instance.addSeriesToMainList(series1, series2)

        // tslint:disable-next-line: no-string-literal
        const list = series1.getAllProviderLocalDatas()
        const trakprovider = list.find(x => x.provider === TraktProvider.getInstance().providerName)
        expect(trakprovider).not.toBeUndefined()

        const list2 = series2.getAllProviderLocalDatas()
        const trakprovider2 = list2.find(x => x.provider === TraktProvider.getInstance().providerName)
        expect(trakprovider2).not.toBeUndefined()
    }, 4000)

    test('should get the right season. Trakt', async () => {
        if (!ListController.instance) {
            throw new Error()
        }
        // s1
        const series1 = new Series()
        const s1provider1 = new ListProviderLocalData(79352, TraktProvider)
        s1provider1.infoStatus = ProviderInfoStatus.ONLY_ID
        series1.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(s1provider1, new Season([1])))

        // s2
        const series2 = new Series()
        const s2provider1 = new ListProviderLocalData(99539, AniListProvider)
        s2provider1.infoStatus = ProviderInfoStatus.ONLY_ID
        series2.addListProvider(s2provider1)

        // s3
        const series3 = new Series()
        const s3provider1 = new ListProviderLocalData(108928, AniListProvider)
        s3provider1.infoStatus = ProviderInfoStatus.ONLY_ID
        series3.addListProvider(s3provider1)

        await ListController.instance.addSeriesToMainList(series1)
        await ListController.instance.addSeriesToMainList(series2)
        await ListController.instance.addSeriesToMainList(series3)
        await MainListManager['finishListFilling']()
        const traktProviderName = ProviderList.getProviderInstanceByClass(TraktProvider).providerName
        const seasonTarget = series3.getProviderSeasonTarget(traktProviderName)

        expect(seasonTarget?.getSingleSeasonNumberAsNumber()).toEqual(3)
        // tslint:disable-next-line: no-string-literal
        const aniListProviderName = ProviderNameManager.getProviderName(AniListProvider)
        const s2 = MainListSearcher.findAllSeriesByProvider(99539, aniListProviderName)[0]
        const season2 = s2?.getProviderSeasonTarget(traktProviderName)
        expect(season2?.getSingleSeasonNumberAsNumber()).toEqual(2)
        const season3 = MainListSearcher.findAllSeriesByProvider(
            108928,
            aniListProviderName
        )[0].getProviderSeasonTarget(traktProviderName)
        expect(season3?.getSingleSeasonNumberAsNumber()).toEqual(3)
    }, 4000)

    test('should get the right season. for shokugeki no souma', async () => {
        if (!ListController.instance) {
            throw new Error()
        }
        // s2
        const series1 = new Series()
        const s1provider1 = new ListProviderLocalData(20923, AniListProvider)
        s1provider1.infoStatus = ProviderInfoStatus.BASIC_INFO
        s1provider1.addSeriesName(new Name('Shokugeki no Souma', 'x-jap', NameType.OFFICIAL))
        s1provider1.addSeriesName(new Name('Food Wars! Shokugeki no Soma', 'unkown', NameType.UNKNOWN))
        s1provider1.addSeriesName(new Name('食戟のソーマ', 'jap', NameType.UNKNOWN))
        s1provider1.releaseYear = 2015
        s1provider1.episodes = 24
        s1provider1.sequelIds.push(21518)
        series1.addListProvider(s1provider1)

        // s2
        const series2 = new Series()
        const s2provider1 = new ListProviderLocalData(21518, AniListProvider)
        s2provider1.infoStatus = ProviderInfoStatus.BASIC_INFO
        s2provider1.addSeriesName(new Name('Shokugeki no Souma: Ni no Sara', 'x-jap', NameType.OFFICIAL))
        s2provider1.addSeriesName(new Name('Food Wars! The Second Plate', 'unkown', NameType.UNKNOWN))
        s2provider1.addSeriesName(new Name('食戟のソーマ 弍ノ皿', 'jap', NameType.UNKNOWN))
        s2provider1.releaseYear = 2016
        s2provider1.episodes = 13
        s2provider1.prequelIds.push(20923)
        series2.addListProvider(s2provider1)

        // s4
        const series4 = new Series()
        const s4provider1 = new ListProviderLocalData(109963, AniListProvider)
        s4provider1.infoStatus = ProviderInfoStatus.ONLY_ID
        series4.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(s4provider1, new Season([4])))

        // s3
        const series3 = new Series()
        const s3provider1 = new ListProviderLocalData(94084, TraktProvider)
        s3provider1.infoStatus = ProviderInfoStatus.ONLY_ID
        series3.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(s3provider1, new Season([3])))

        await ListController.instance.addSeriesToMainList(series1, series2)
        await ListController.instance.addSeriesToMainList(series3)
        await ListController.instance.addSeriesToMainList(series4)

        const result = await new DownloadProviderLocalDataWithoutId(
            series2,
            ProviderList.getProviderInstanceByClass(TraktProvider)
        )['linkProviderDataFromRelations']()

        expect(
            series2.getProviderSeasonTarget(result.providerLocalData.provider)?.getSingleSeasonNumberAsNumber()
        ).toBe(2)

        const seasonTarget = series2.getProviderSeasonTarget(TraktProvider.getInstance().providerName)

        expect(seasonTarget?.getSingleSeasonNumberAsNumber()).toBe(2)
        // tslint:disable-next-line: no-string-literal
        const provider = series2
            .getAllProviderLocalDatas()
            .find(x => x.provider === TraktProvider.getInstance().providerName)
        if (provider != null) {
            for (const episode of provider.getDetailEpisodeInfos()) {
                if (episode.season?.getSingleSeasonNumberAsNumber() === 1) {
                    const s1Result = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(
                        series1.episodeBindingPools,
                        episode
                    )
                    const relevantResult = s1Result.find(
                        x => x.provider === ProviderNameManager.getProviderName(AniListProvider)
                    )
                    expect(relevantResult).not.toBeUndefined()
                } else if (episode.season?.getSingleSeasonNumberAsNumber() === 2) {
                    const s2BindedEpisodeResult = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(
                        series2.episodeBindingPools,
                        episode
                    )
                    const relevantResult = s2BindedEpisodeResult.find(
                        x => x.provider === ProviderNameManager.getProviderName(AniListProvider)
                    )
                    expect(relevantResult).not.toBeUndefined()
                } else if (episode.season?.getSingleSeasonNumberAsNumber() === 3) {
                    const allEpisodeBindingsPool = MainListManager.getMainList().flatMap(x => x.episodeBindingPools)
                    const len = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(allEpisodeBindingsPool, episode)
                    const s = len.find(x => x.provider === ProviderNameManager.getProviderName(AniListProvider))
                    if ((episode.episodeNumber as number) < 13) {
                        expect(s?.episodeNumber).toBe(episode.episodeNumber)
                        expect(s?.providerSeriesId).toBe(99255)
                    } else {
                        expect((s?.episodeNumber as number) + 12).toBe(episode.episodeNumber)
                        expect(s?.providerSeriesId).toBe(100773)
                    }
                    expect(len.length).toBeGreaterThanOrEqual(2)
                } else if (episode.season?.getSingleSeasonNumberAsNumber() === 4) {
                    const result = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(
                        series4.episodeBindingPools,
                        episode
                    )
                    const relevantResult = result.find(
                        x => x.provider === ProviderNameManager.getProviderName(AniListProvider)
                    )
                    expect(relevantResult).not.toBeUndefined()
                }
                logger.warn(episode.episodeNumber + ' S: ' + episode.season?.getSingleSeasonNumberAsNumber())
            }
            const season = series2.getProviderSeasonTarget(provider.provider)
            expect(season?.getSingleSeasonNumberAsNumber()).toEqual(2)
        } else {
            throw new Error()
        }
    }, 4000)

    test('should get series and should map episodes right (Series: Clannad) (Has different max episode number on S1)', async () => {
        const provider = new ListProviderLocalData(2167, AniListProvider)
        provider.addSeriesName(new Name('Clannad', 'en', NameType.OFFICIAL))

        const series = new Series()
        series.addProviderDatas(provider)
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
        expect(aniListBinding?.providerLocalData.id).toBe(2167)

        const traktName = ProviderNameManager.getProviderName(TraktProvider)
        const traktBinding = bindings.find(x => x.providerLocalData.provider === traktName)
        expect(traktBinding?.providerLocalData.provider).toBe(traktName)
        expect(traktBinding?.providerLocalData.id).toEqual(24724)
    })

    test('should get series and should map episodes right (Series: Nanbaka)', async () => {
        const provider = new ListProviderLocalData(110252, TraktProvider)

        const series = new Series()
        series.addProviderDatas(provider)
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
        expect(aniListBinding?.providerLocalData.id).toBe(21051)

        const traktName = ProviderNameManager.getProviderName(TraktProvider)
        const traktBinding = bindings.find(x => x.providerLocalData.provider === traktName)
        expect(traktBinding?.providerLocalData.provider).toBe(traktName)
        expect(traktBinding?.providerLocalData.id).toBe(110252)

        const epMappings = resultSeries.episodeBindingPools
        for (const epMapping of epMappings) {
            const relevantResult = epMapping.bindedEpisodeMappings.find(
                x => x.provider === ProviderNameManager.getProviderName(AniListProvider)
            )
            expect(relevantResult).toBe(undefined)
            for (const ep of epMapping.bindedEpisodeMappings) {
                for (const ep2 of epMapping.bindedEpisodeMappings) {
                    expect(ep.episodeNumber).toEqual(ep2.episodeNumber)
                }
            }
        }
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
        expect(mainList.length).toBe(1)

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
            expect(relevantResult).toBe(undefined)
            for (const ep of epMapping.bindedEpisodeMappings) {
                for (const ep2 of epMapping.bindedEpisodeMappings) {
                    expect(ep.episodeNumber).toEqual(ep2.episodeNumber)
                }
            }
        }
    })

    test('should get series and should map episodes right (Series: The Melancholy of Haruhi Suzumiya)', async () => {
        const provider = new ListProviderLocalData(60988, TraktProvider)

        const series = new Series()
        series.addProviderDatas(provider)
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
        expect(aniListBinding?.providerLocalData.id).toBe(849)

        const traktName = ProviderNameManager.getProviderName(TraktProvider)
        const traktBinding = bindings.find(x => x.providerLocalData.provider === traktName)
        expect(traktBinding?.providerLocalData.provider).toBe(traktName)
        expect(traktBinding?.providerLocalData.id).toBe(60988)

        const epMappings = resultSeries.episodeBindingPools
        expect(epMappings.length).toBe(14)
        for (const epMapping of epMappings) {
            const relevantResult = epMapping.bindedEpisodeMappings.find(
                x => x.provider === ProviderNameManager.getProviderName(AniListProvider)
            )
            expect(relevantResult).toBe(undefined)
            for (const ep of epMapping.bindedEpisodeMappings) {
                for (const ep2 of epMapping.bindedEpisodeMappings) {
                    expect(ep.episodeNumber).toEqual(ep2.episodeNumber)
                }
            }
        }
    })

    test('should get series and should map episodes right from Trakt (Series: Gakusen Toshi Asterisk S1)', async () => {
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
        expect(traktBinding?.seasonTarget?.seasonPart).toBe(1)

        const epMappings = resultSeries.episodeBindingPools
        expect(epMappings.length).toBe(12)
        for (const epMapping of epMappings) {
            const anistListMapping = epMapping.bindedEpisodeMappings.find(
                x => x.provider === ProviderNameManager.getProviderName(AniListProvider)
            )
            const traktListMapping = epMapping.bindedEpisodeMappings.find(
                x => x.provider === ProviderNameManager.getProviderName(TraktProvider)
            )

            expect(anistListMapping).toBeUndefined()
            expect(traktListMapping).toBeUndefined()
            for (const ep of epMapping.bindedEpisodeMappings) {
                for (const ep2 of epMapping.bindedEpisodeMappings) {
                    expect(ep.episodeNumber).toEqual(ep2.episodeNumber)
                }
            }
        }
    })

    test('should get series and should map episodes right from AniList (Series: Gakusen Toshi Asterisk S2)', async () => {
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

        const aniListName = ProviderNameManager.getProviderName(AniListProvider)
        const aniListBinding = bindings.find(x => x.providerLocalData.provider === aniListName)
        expect(aniListBinding?.providerLocalData.provider).toBe(aniListName)
        expect(aniListBinding?.providerLocalData.id).toBe(21390)

        const traktName = ProviderNameManager.getProviderName(TraktProvider)
        const traktBinding = bindings.find(x => x.providerLocalData.provider === traktName)
        expect(traktBinding?.providerLocalData.provider).toBe(ProviderNameManager.getProviderName(TraktProvider))
        expect(traktBinding?.providerLocalData.id).toBe(97794)
        expect(traktBinding?.seasonTarget?.seasonNumbers[0]).toBe(1)
        expect(traktBinding?.seasonTarget?.seasonPart).toBe(2)

        const epMappings = resultSeries.episodeBindingPools
        expect(epMappings.length).toBe(12)
        for (const epMapping of epMappings) {
            const stra = epMapping.bindedEpisodeMappings.find(x => x.provider === aniListName)
            expect(stra).not.toEqual(undefined)
        }
    })
    test.todo('Trakt id: 65266 (All season seperate)')
})
