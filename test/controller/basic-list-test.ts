import { fail, notEqual, notStrictEqual, strictEqual } from 'assert';
import AniDBProvider from '../../src/backend/api/anidb/anidb-provider';
import AniListProvider from '../../src/backend/api/anilist/anilist-provider';
import MultiProviderResult from '../../src/backend/api/provider/multi-provider-result';
import TraktProvider from '../../src/backend/api/trakt/trakt-provider';
import TVDBProvider from '../../src/backend/api/tvdb/tvdb-provider';
import ListController from '../../src/backend/controller/list-controller';
import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager';
import MainListSearcher from '../../src/backend/controller/main-list-manager/main-list-searcher';
import { EpisodeType } from '../../src/backend/controller/objects/meta/episode/episode-type';
import Name from '../../src/backend/controller/objects/meta/name';
import { NameType } from '../../src/backend/controller/objects/meta/name-type';
import Season from '../../src/backend/controller/objects/meta/season';
import Series from '../../src/backend/controller/objects/series';
import { InfoProviderLocalData } from '../../src/backend/controller/provider-manager/local-data/info-provider-local-data';
import { ProviderInfoStatus } from '../../src/backend/controller/provider-manager/local-data/interfaces/provider-info-status';
import { ListProviderLocalData } from '../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../src/backend/controller/provider-manager/provider-list';
import EpisodeBindingPoolHelper from '../../src/backend/helpFunctions/episode-binding-pool-helper';
import ProviderDataWithSeasonInfo from '../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import providerInfoDownloaderhelper from '../../src/backend/helpFunctions/provider/provider-info-downloader/provider-info-downloaderhelper';
import seriesHelper from '../../src/backend/helpFunctions/series-helper';
import logger from '../../src/backend/logger/logger';
import TestHelper from '../test-helper';

// tslint:disable: no-string-literal
describe('Basic List | Testrun', () => {

    beforeAll(() => {
        TestHelper.mustHaveBefore();
        const anilistInstance = ProviderList.getListProviderList().find((x) => x.providerName === AniListProvider.getInstance().providerName);
        if (!anilistInstance) { fail(); }
        anilistInstance.isUserLoggedIn = async () => true;
        const traktInstance = ProviderList.getListProviderList().find((x) => x.providerName === TraktProvider.getInstance().providerName);
        if (!traktInstance) { fail(); }
        traktInstance.isUserLoggedIn = async () => true;
    });

    beforeEach(() => {
        MainListManager['mainList'] = [];
    });

    test('should find other provider and mapping them.', async () => {
        if (!ListController.instance) {
            fail();
        }
        const series = new Series();
        const provider = new ListProviderLocalData(101348, AniListProvider);
        provider.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series.addListProvider(provider);

        await ListController.instance.addSeriesToMainList(series);

        // tslint:disable-next-line: no-string-literal
        strictEqual(MainListManager['mainList'].length, 1);

        // tslint:disable-next-line: no-string-literal
        const updatedProviders = MainListManager['mainList'][0].getAllProviderLocalDatas();

        // provider should got been updated

        const anilistResult = updatedProviders.find((x) => x.provider === AniListProvider.getInstance().providerName);
        const traktResult = updatedProviders.find((x) => x.provider === TraktProvider.getInstance().providerName);
        if (anilistResult && traktResult) {
            notStrictEqual(anilistResult.detailEpisodeInfo.length, 0);
            notStrictEqual(traktResult.detailEpisodeInfo.length, 0);
            notStrictEqual(anilistResult.getAllNames().length, 0);
            notStrictEqual(traktResult.getAllNames().length, 0);
            strictEqual(traktResult.version, ProviderInfoStatus.ADVANCED_BASIC_INFO);
            strictEqual(anilistResult.version, ProviderInfoStatus.ADVANCED_BASIC_INFO);
        } else {
            fail();
        }
    }, 4000);

    test(
        'should find other provider and mapping two season together.',
        async () => {
            if (!ListController.instance) {
                fail();
            }
            // S1
            const series = new Series();
            const provider = new ListProviderLocalData(21202, AniListProvider);
            provider.infoStatus = ProviderInfoStatus.ONLY_ID;
            await series.addListProvider(provider);

            await ListController.instance.addSeriesToMainList(series);

            // S2
            const series2 = new Series();
            const provider2 = new ListProviderLocalData(21699, AniListProvider);
            provider2.infoStatus = ProviderInfoStatus.ONLY_ID;
            await series2.addListProvider(provider2);

            await ListController.instance.addSeriesToMainList(series2);

            // tslint:disable-next-line: no-string-literal
            strictEqual(MainListManager['mainList'].length, 2);

            // tslint:disable-next-line: no-string-literal
            const updatedProviders = MainListManager['mainList'][0].getAllProviderLocalDatas();
            // tslint:disable-next-line: no-string-literal
            const updatedProviders2 = MainListManager['mainList'][1].getAllProviderLocalDatas();
            // provider should got been updated

            const anilistResult = updatedProviders.find((x) => x.provider === AniListProvider.getInstance().providerName);
            const traktResult = updatedProviders.find((x) => x.provider === TraktProvider.getInstance().providerName);

            const anilistResult2 = updatedProviders2.find((x) => x.provider === AniListProvider.getInstance().providerName);
            const traktResult2 = updatedProviders2.find((x) => x.provider === TraktProvider.getInstance().providerName);
            if (anilistResult && traktResult && anilistResult2 && traktResult2) {
                notStrictEqual(anilistResult.detailEpisodeInfo.length, 0);
                notStrictEqual(traktResult.detailEpisodeInfo.length, 0);
                notStrictEqual(anilistResult.getAllNames().length, 0);
                notStrictEqual(traktResult.getAllNames().length, 0);
                strictEqual(traktResult.version, ProviderInfoStatus.ADVANCED_BASIC_INFO);
                strictEqual(anilistResult.version, ProviderInfoStatus.ADVANCED_BASIC_INFO);
                for (const anilistResultEntry of anilistResult.detailEpisodeInfo) {
                    strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(series.episodeBindingPools, anilistResultEntry)[0].episodeNumber, anilistResultEntry.episodeNumber);
                }
                for (const anilistResult2Entry of anilistResult2.detailEpisodeInfo) {
                    strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(series.episodeBindingPools, anilistResult2Entry)[0].episodeNumber, anilistResult2Entry.episodeNumber);
                }
                for (const trakt of traktResult2.detailEpisodeInfo) {
                    if (trakt.type === EpisodeType.SPECIAL) {
                        const r = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(series2.episodeBindingPools, trakt);
                        strictEqual(r.length, 0);
                    } else {
                        if (trakt?.season?.seasonNumber === 2) {
                            const r = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(series2.episodeBindingPools, trakt);
                            notStrictEqual(r.length, 0);
                            strictEqual(r[0].episodeNumber, trakt.episodeNumber);
                        }
                    }
                }
            } else {
                fail();
            }
        }, 4000);

    test('should not merge them together', async () => {
        if (!ListController.instance) {
            fail();
        }

        // S1
        const series1 = new Series();
        const s1provider2 = new ListProviderLocalData(20920, AniListProvider);
        s1provider2.infoStatus = ProviderInfoStatus.ONLY_ID;
        const s1provider3 = new ListProviderLocalData(94090, TraktProvider);
        s1provider3.infoStatus = ProviderInfoStatus.ONLY_ID;
        const s1provider5 = new InfoProviderLocalData(289882, TVDBProvider);
        s1provider5.infoStatus = ProviderInfoStatus.ONLY_ID;
        const s1provider6 = new InfoProviderLocalData('tt4728568', 'imdb');
        s1provider6.infoStatus = ProviderInfoStatus.ONLY_ID;
        const s1provider7 = new InfoProviderLocalData(62745, 'tmdb');
        s1provider7.infoStatus = ProviderInfoStatus.ONLY_ID;
        const s1provider8 = new InfoProviderLocalData(5312, 'tvmaze');
        s1provider8.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series1.addListProvider(s1provider2);
        await series1.addListProvider(s1provider3);
        await series1.addInfoProvider(s1provider5);
        await series1.addInfoProvider(s1provider6);
        await series1.addInfoProvider(s1provider7);

        await ListController.instance.addSeriesToMainList(series1);
        // S2
        const series2 = new Series();
        const s2provider2 = new ListProviderLocalData(101167, AniListProvider);
        s2provider2.infoStatus = ProviderInfoStatus.ONLY_ID;
        const s2provider3 = new ListProviderLocalData(94090, TraktProvider);
        s2provider3.infoStatus = ProviderInfoStatus.ONLY_ID;
        const s2provider5 = new InfoProviderLocalData(289882, TVDBProvider);
        s2provider5.infoStatus = ProviderInfoStatus.ONLY_ID;
        const s2provider6 = new InfoProviderLocalData('tt4728568', 'imdb');
        s2provider6.infoStatus = ProviderInfoStatus.ONLY_ID;
        const s2provider7 = new InfoProviderLocalData(62745, 'tmdb');
        s2provider7.infoStatus = ProviderInfoStatus.ONLY_ID;
        const s2provider8 = new InfoProviderLocalData(5312, 'tvmaze');
        s2provider8.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series2.addListProvider(s2provider2);
        await series2.addListProvider(s2provider3);
        await series2.addInfoProvider(s2provider5);
        await series2.addInfoProvider(s2provider6);
        await series2.addInfoProvider(s2provider7);

        await ListController.instance.addSeriesToMainList(series2);
        // tslint:disable-next-line: no-string-literal
        await MainListManager['finishListFilling']();
        // tslint:disable-next-line: no-string-literal
        strictEqual(MainListManager['mainList'].length, 2);
        strictEqual(await seriesHelper.isSameSeries(series1, series2), false);
    }, 4000);

    test('should not merge different animes', async () => {
        if (!ListController.instance) {
            fail();
        }

        const series1 = new Series();
        const s1provider1 = new ListProviderLocalData(21858, AniListProvider);
        s1provider1.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series1.addListProvider(s1provider1);

        const series2 = new Series();
        const s2provider1 = new ListProviderLocalData(21776, AniListProvider);
        s2provider1.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series2.addListProvider(s2provider1);
        await ListController.instance.addSeriesToMainList(series1, series2);

        const series3 = new Series();
        const s3provider1 = new ListProviderLocalData(117492, TraktProvider);
        s3provider1.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series3.addListProvider(s3provider1);

        await ListController.instance.addSeriesToMainList(series3);
        // tslint:disable-next-line: no-string-literal
        await MainListManager['finishListFilling']();
        // tslint:disable-next-line: no-string-literal
        strictEqual(MainListManager['mainList'].length, 3);
        strictEqual(await seriesHelper.isSameSeries(series1, series3), false);
        strictEqual(await seriesHelper.isSameSeries(series2, series3), false);
    }, 4000);

    test('should not merge series with anime', async () => {
        if (!ListController.instance) {
            fail();
        }

        const series1 = new Series();
        const s1provider1 = new ListProviderLocalData(108632, AniListProvider);
        s1provider1.infoStatus = ProviderInfoStatus.ONLY_ID;
        const s1provider2 = new InfoProviderLocalData(11370, AniDBProvider);
        s1provider2.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series1.addListProvider(s1provider1);
        await series1.addInfoProvider(s1provider2);

        const series2 = new Series();
        const s2provider1 = new ListProviderLocalData(1390, TraktProvider);
        s2provider1.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series2.addListProvider(s2provider1);
        await ListController.instance.addSeriesToMainList(series1, series2);
        // tslint:disable-next-line: no-string-literal
        await MainListManager['finishListFilling']();
        // tslint:disable-next-line: no-string-literal
        strictEqual(MainListManager['mainList'].length, 2);
        strictEqual(await seriesHelper.isSameSeries(series1, series2), false);
    }, 4000);

    test('should not merge season 1 with season 2', async () => {
        if (!ListController.instance) {
            fail();
        }
        // s1
        const series1 = new Series();
        const s1provider1 = new ListProviderLocalData(8675, AniListProvider);
        s1provider1.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series1.addListProvider(s1provider1);
        // s2
        const series2 = new Series();
        const s2provider1 = new ListProviderLocalData(20448, AniListProvider);
        s2provider1.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series2.addListProvider(s2provider1);
        await ListController.instance.addSeriesToMainList(series1, series2);
        // tslint:disable-next-line: no-string-literal
        await MainListManager['finishListFilling']();
        // tslint:disable-next-line: no-string-literal
        strictEqual(MainListManager['mainList'].length, 2);
        strictEqual(await seriesHelper.isSameSeries(series1, series2), false);
    }, 4000);

    test('should create only 2 series', async () => {
        if (!ListController.instance) {
            fail();
        }
        // s1
        const series1 = new Series();
        const s1provider1 = new ListProviderLocalData(20853, AniListProvider);
        s1provider1.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series1.addListProvider(s1provider1);
        // s2
        const series2 = new Series();
        const s2provider1 = new ListProviderLocalData(20632, AniListProvider);
        s2provider1.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series2.addListProvider(s2provider1);

        const series3 = new Series();
        const s3provider1 = new ListProviderLocalData(20853, AniListProvider);
        s3provider1.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series3.addListProvider(s3provider1);

        await ListController.instance.addSeriesToMainList(series1, series2, series3);

        // tslint:disable-next-line: no-string-literal
        await MainListManager['finishListFilling']();
        // tslint:disable-next-line: no-string-literal
        strictEqual(MainListManager['mainList'].length, 2);
    }, 4000);

    test('should not create too much detailed episodes', async () => {
        if (!ListController.instance) {
            fail();
        }
        // s1
        const series1 = new Series();
        const s1provider1 = new ListProviderLocalData(46004, TraktProvider);
        s1provider1.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series1.addListProvider(s1provider1);

        await ListController.instance.addSeriesToMainList(series1);

        // tslint:disable-next-line: no-string-literal
        await MainListManager['finishListFilling']();
        // tslint:disable-next-line: no-string-literal
        strictEqual(MainListManager['mainList'].length, 1);
        const provider = MainListManager['mainList'][0].getAllProviderLocalDatas().find((x) => x.provider === TraktProvider.getInstance().providerName);
        if (provider != null) {
            for (const iterator of provider.detailEpisodeInfo) {
                logger.warn(iterator.episodeNumber + ' S: ' + iterator.season);
            }
            strictEqual(provider.detailEpisodeInfo.length, 341);
        } else {
            fail();
        }
    }, 4000);

    test('should update', async () => {
        if (!ListController.instance) {
            fail();
        }
        // s1
        const series1 = new Series();
        const s1provider1 = new ListProviderLocalData(20605, AniListProvider);
        s1provider1.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series1.addListProvider(s1provider1);

        await ListController.instance.addSeriesToMainList(series1);

        // tslint:disable-next-line: no-string-literal
        await MainListManager['finishListFilling']();
        // tslint:disable-next-line: no-string-literal
        const mpr = new MultiProviderResult(s1provider1);
        const result = await MainListSearcher['findSeriesWithMultiProviderResult'](mpr);

        notEqual(result, null);
    }, 4000);


    test('should not get season 1 on season 2', async () => {
        if (!ListController.instance) {
            fail();
        }
        // s1
        const series1 = new Series();
        const s1provider1 = new ListProviderLocalData(20521, AniListProvider);
        s1provider1.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series1.addListProvider(s1provider1);

        // s2
        const series2 = new Series();
        const s2provider1 = new ListProviderLocalData(20711, AniListProvider);
        s2provider1.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series2.addListProvider(s2provider1);

        // s3
        const series3 = new Series();
        const s3provider1 = new ListProviderLocalData(60931, TraktProvider);
        s3provider1.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series3.addListProvider(s3provider1);

        await ListController.instance.addSeriesToMainList(series2, series1, series3);

        // tslint:disable-next-line: no-string-literal
        await MainListManager['finishListFilling']();
        // tslint:disable-next-line: no-string-literal
        const mpr1 = new MultiProviderResult(s1provider1);
        const mpr2 = new MultiProviderResult(s2provider1);
        const resultS1 = await MainListSearcher['findSeriesWithMultiProviderResult'](mpr1);
        const resultS2 = await MainListSearcher['findSeriesWithMultiProviderResult'](mpr2);
        if (resultS1 && resultS2) {
            const traktProviderS1 = resultS1.getAllProviderLocalDatas().find((x) => x.provider === TraktProvider.getInstance().providerName);
            const traktProviderS2 = resultS2.getAllProviderLocalDatas().find((x) => x.provider === TraktProvider.getInstance().providerName);
            if (traktProviderS1 && traktProviderS2) {
                strictEqual(resultS1.getProviderSeasonTarget(traktProviderS1.provider)?.seasonNumber, 1);
                strictEqual(resultS2.getProviderSeasonTarget(traktProviderS2.provider)?.seasonNumber, 2);
            } else {
                fail();
            }
        } else {
            fail();
        }
    }, 4000);

    test('should get trakt info data on all seasons', async () => {
        if (!ListController.instance) {
            fail();
        }
        // s1
        const series1 = new Series();
        const s1provider1 = new ListProviderLocalData(20994, AniListProvider);
        s1provider1.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series1.addListProvider(s1provider1);

        // s2
        const series2 = new Series();
        const s2provider1 = new ListProviderLocalData(21364, AniListProvider);
        s2provider1.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series2.addListProvider(s2provider1);

        await ListController.instance.addSeriesToMainList(series1, series2);

        // tslint:disable-next-line: no-string-literal
        const list = series1.getAllProviderLocalDatas();
        const trakprovider = list.find((x) => x.provider === TraktProvider.getInstance().providerName);
        notEqual(trakprovider, null);

        const list2 = await series2.getAllProviderLocalDatas();
        const trakprovider2 = list2.find((x) => x.provider === TraktProvider.getInstance().providerName);
        notEqual(trakprovider2, null);
    }, 4000);

    test('should get the right season.', async () => {
        if (!ListController.instance) {
            fail();
        }
        // s1
        const series1 = new Series();
        const s1provider1 = new ListProviderLocalData(79352, TraktProvider);
        s1provider1.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series1.addListProvider(s1provider1);

        // s2
        const series2 = new Series();
        const s2provider1 = new ListProviderLocalData(99539, AniListProvider);
        s2provider1.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series2.addListProvider(s2provider1);

        // s3
        const series3 = new Series();
        const s3provider1 = new ListProviderLocalData(108928, AniListProvider);
        s3provider1.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series3.addListProvider(s3provider1);

        await ListController.instance.addSeriesToMainList(series1);
        await ListController.instance.addSeriesToMainList(series2);
        await ListController.instance.addSeriesToMainList(series3);
        await MainListManager['finishListFilling']();

        const seasonTarget = series3.getProviderSeasonTarget(TraktProvider.getInstance().providerName);

        strictEqual(seasonTarget?.seasonNumber, 3);
        // tslint:disable-next-line: no-string-literal
        const provider = MainListManager['mainList'][2].getAllProviderLocalDatas().find((x) => x.provider === TraktProvider.getInstance().providerName);
        if (provider != null) {
            for (const iterator of provider.detailEpisodeInfo) {
                logger.warn(iterator.episodeNumber + ' S: ' + iterator.season);
            }
            const season = MainListManager['mainList'][2].getProviderSeasonTarget(provider.provider);
            strictEqual(season?.seasonNumber, 3);
        } else {
            fail();
        }
    }, 4000);

    test('should get the right season. 2', async () => {
        if (!ListController.instance) {
            fail();
        }
        // s2
        const series1 = new Series();
        const s1provider1 = new ListProviderLocalData(20923, AniListProvider);
        s1provider1.infoStatus = ProviderInfoStatus.BASIC_INFO;
        s1provider1.addSeriesName(new Name('Shokugeki no Souma', 'x-jap', NameType.OFFICIAL));
        s1provider1.addSeriesName(new Name('Food Wars! Shokugeki no Soma', 'unkown', NameType.UNKNOWN));
        s1provider1.addSeriesName(new Name('食戟のソーマ', 'jap', NameType.UNKNOWN));
        s1provider1.releaseYear = 2015;
        s1provider1.episodes = 24;
        s1provider1.sequelIds.push(21518);
        await series1.addListProvider(s1provider1);

        // s2
        const series2 = new Series();
        const s2provider1 = new ListProviderLocalData(21518, AniListProvider);
        s2provider1.infoStatus = ProviderInfoStatus.BASIC_INFO;
        s2provider1.addSeriesName(new Name('Shokugeki no Souma: Ni no Sara', 'x-jap', NameType.OFFICIAL));
        s2provider1.addSeriesName(new Name('Food Wars! The Second Plate', 'unkown', NameType.UNKNOWN));
        s2provider1.addSeriesName(new Name('食戟のソーマ 弍ノ皿', 'jap', NameType.UNKNOWN));
        s2provider1.releaseYear = 2016;
        s2provider1.episodes = 13;
        s2provider1.prequelIds.push(20923);
        await series2.addListProvider(s2provider1);

        // s4
        const series4 = new Series();
        const s4provider1 = new ListProviderLocalData(109963, AniListProvider);
        s4provider1.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series4.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(s4provider1, new Season(4)));

        // s3
        const series3 = new Series();
        const s3provider1 = new ListProviderLocalData(94084, TraktProvider);
        s3provider1.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series3.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(s3provider1, new Season(3)));

        await ListController.instance.addSeriesToMainList(series1, series2);
        await ListController.instance.addSeriesToMainList(series3);
        await ListController.instance.addSeriesToMainList(series4);

        const result = await providerInfoDownloaderhelper['linkProviderDataFromRelations'](series2, TraktProvider.getInstance());

        strictEqual(series2.getProviderSeasonTarget(result.providerLocalData.provider)?.seasonNumber, 2);

        const seasonTarget = series2.getProviderSeasonTarget(TraktProvider.getInstance().providerName);

        strictEqual(seasonTarget?.seasonNumber, 2);
        // tslint:disable-next-line: no-string-literal
        const provider = series2.getAllProviderLocalDatas().find((x) => x.provider === TraktProvider.getInstance().providerName);
        if (provider != null) {
            for (const episode of provider.detailEpisodeInfo) {
                if (episode.season?.seasonNumber === 1) {
                    notStrictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(series1.episodeBindingPools, episode).length, 0);
                } else if (episode.season?.seasonNumber === 2) {
                    notStrictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(series2.episodeBindingPools, episode).length, 0);
                } else if (episode.season?.seasonNumber === 3) {
                    const len = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(series3.episodeBindingPools, episode).length;
                    notStrictEqual(len, 0);
                } else if (episode.season?.seasonNumber === 4) {
                    notStrictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(series4.episodeBindingPools, episode).length, 0);
                }
                logger.warn(episode.episodeNumber + ' S: ' + episode.season);
            }
            const season = series2.getProviderSeasonTarget(provider.provider);
            strictEqual(season?.seasonNumber, 2);
        } else {
            fail();
        }
    }, 4000);
});
