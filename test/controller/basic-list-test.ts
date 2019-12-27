import { fail, notStrictEqual, strictEqual } from 'assert';
import AniDBProvider from '../../src/backend/api/anidb/anidb-provider';
import AniListProvider from '../../src/backend/api/anilist/anilist-provider';
import TraktProvider from '../../src/backend/api/trakt/trakt-provider';
import TVDBProvider from '../../src/backend/api/tvdb/tvdb-provider';
import ListController from '../../src/backend/controller/list-controller';
import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager';
import { EpisodeType } from '../../src/backend/controller/objects/meta/episode/episode-type';
import Series from '../../src/backend/controller/objects/series';
import { InfoProviderLocalData } from '../../src/backend/controller/provider-manager/local-data/info-provider-local-data';
import { ProviderInfoStatus } from '../../src/backend/controller/provider-manager/local-data/interfaces/provider-info-status';
import { ListProviderLocalData } from '../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../src/backend/controller/provider-manager/provider-list';
import seriesHelper from '../../src/backend/helpFunctions/series-helper';
import TestHelper from '../test-helper';

describe('Basic List | Testrun', () => {
    const lc = new ListController(true);

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
        // tslint:disable-next-line: no-string-literal
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
                    strictEqual(anilistResultEntry.mappedTo[0].episodeNumber, anilistResultEntry.episodeNumber);
                }
                for (const anilistResult2Entry of anilistResult2.detailEpisodeInfo) {
                    strictEqual(anilistResult2Entry.mappedTo[0].episodeNumber, anilistResult2Entry.episodeNumber);
                }
                for (const trakt of traktResult2.detailEpisodeInfo) {
                    if (trakt.type === EpisodeType.SPECIAL) {
                        strictEqual(trakt.mappedTo.length, 0);
                    } else {
                        strictEqual(trakt.mappedTo.length, 1);
                        strictEqual(trakt.mappedTo[0].episodeNumber, trakt.episodeNumber);
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
        const s1provider4 = new InfoProviderLocalData(10894, AniDBProvider);
        s1provider4.infoStatus = ProviderInfoStatus.ONLY_ID;
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
        await series1.addInfoProvider(s1provider4);
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
        const s2provider4 = new InfoProviderLocalData(10894, AniDBProvider);
        s2provider4.infoStatus = ProviderInfoStatus.ONLY_ID;
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
        await series2.addInfoProvider(s2provider4);
        await series2.addInfoProvider(s2provider5);
        await series2.addInfoProvider(s2provider6);
        await series2.addInfoProvider(s2provider7);

        await ListController.instance.addSeriesToMainList(series2);
        // tslint:disable-next-line: no-string-literal
        await MainListManager['finishListFilling']();
        // tslint:disable-next-line: no-string-literal
        strictEqual(MainListManager['mainList'].length, 2);
        strictEqual(await seriesHelper.isSameSeries(series1, series2), false);
    });

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
        strictEqual(MainListManager['mainList'].length, 3);
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
        s1provider1.targetSeason = 1;
        await series1.addListProvider(s1provider1);
        // s2
        const series2 = new Series();
        const s2provider1 = new ListProviderLocalData(20632, AniListProvider);
        s2provider1.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series2.addListProvider(s2provider1);

        const series3 = new Series();
        const s3provider1 = new ListProviderLocalData(20853 , AniListProvider);
        s3provider1.infoStatus = ProviderInfoStatus.ONLY_ID;
        s3provider1.targetSeason = 2;
        await series3.addListProvider(s3provider1);

        await ListController.instance.addSeriesToMainList(series1, series2, series3);

        // tslint:disable-next-line: no-string-literal
        await MainListManager['finishListFilling']();
        // tslint:disable-next-line: no-string-literal
        strictEqual(MainListManager['mainList'].length, 2);
    }, 4000);
});
