
import { deepEqual, fail } from 'assert';
import AniDBProvider from '../../../src/backend/api/anidb/anidb-provider';
import AniListProvider from '../../../src/backend/api/anilist/anilist-provider';
import { MediaType } from '../../../src/backend/controller/objects/meta/media-type';
import Name from '../../../src/backend/controller/objects/meta/name';
import { NameType } from '../../../src/backend/controller/objects/meta/name-type';
import Series, { WatchStatus } from '../../../src/backend/controller/objects/series';
import { ProviderInfoStatus } from '../../../src/backend/controller/provider-manager/local-data/interfaces/provider-info-status';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';
import providerInfoDownloaderhelper from '../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-info-downloaderhelper';
import logger from '../../../src/backend/logger/logger';
import TestHelper from '../../test-helper';


describe('Provider: AniDB | Offline Test runs', () => {
    beforeAll(() => {
        TestHelper.mustHaveBefore();
    });

    beforeEach(() => {
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'] = [new AniListProvider()];
    });
    describe('Download Tests', () => {
       test('should allow download (1/2)', async () => {
            const x = new AniDBProvider(false);
            // tslint:disable-next-line: no-string-literal
            AniDBProvider['anidbNameManager'].lastDownloadTime = undefined;
            // tslint:disable-next-line: no-string-literal
            deepEqual(x['allowDownload'](), true);
            return;
        });
       test('should allow download (2/2)', async () => {
            const a = new AniDBProvider(false);
            const twoDaysInMs = 172800000;
            // tslint:disable-next-line: no-string-literal
            AniDBProvider['anidbNameManager'].lastDownloadTime = new Date(Date.now() - twoDaysInMs * 2);
            // tslint:disable-next-line: no-string-literal
            deepEqual(a['allowDownload'](), true);
            return;
        });
       test('should not allow download', async () => {
            const a = new AniDBProvider(false);
            // tslint:disable-next-line: no-string-literal
            AniDBProvider['anidbNameManager'].lastDownloadTime = new Date(Date.now());
            // tslint:disable-next-line: no-string-literal
            deepEqual(a['allowDownload'](), false);
            return;
        });
    });

    test('should find id 9579', async () => {
        const a = new AniDBProvider(false);
        const lpdld = new ListProviderLocalData(9993, 'AniList');
        lpdld.episodes = 12;
        lpdld.infoStatus = ProviderInfoStatus.FULL_INFO;
        lpdld.targetSeason = 1;
        lpdld.watchStatus = WatchStatus.DROPPED;

        const series = new Series();
        // tslint:disable-next-line: no-string-literal
        series['cachedSeason'] = 1;
        // tslint:disable-next-line: no-string-literal
        series['canSync'] = false;
        // tslint:disable-next-line: no-string-literal
        lpdld['episodes'] = 12;
        lpdld.isNSFW = false;
        lpdld.mediaType = MediaType.SERIES;
        lpdld.releaseYear = 2013;
        lpdld.addSeriesName(new Name('Kiniro Mosaic', 'x-jap', NameType.OFFICIAL));
        lpdld.addSeriesName(new Name('KINMOZA!', 'en', NameType.OFFICIAL));
        lpdld.addSeriesName(new Name('きんいろモザイク', 'jap', NameType.OFFICIAL));
        await series.addListProvider(lpdld);
        const result = await a.getMoreSeriesInfoByName('Kiniro Mosaic', 1);

        deepEqual(result[0].mainProvider.id, '9579');
    });


    test('should find id 13310', async () => {
        const a = new AniDBProvider(false);
        const lpdld = new ListProviderLocalData(9994, 'AniList');
        lpdld.episodes = 12;
        lpdld.infoStatus = ProviderInfoStatus.FULL_INFO;
        lpdld.watchStatus = WatchStatus.DROPPED;

        const series = new Series();
        // tslint:disable-next-line: no-string-literal
        series['cachedSeason'] = -1;
        // tslint:disable-next-line: no-string-literal
        series['canSync'] = false;
        lpdld.isNSFW = false;
        lpdld.mediaType = MediaType.MOVIE;
        lpdld.releaseYear = 2019;
        lpdld.addSeriesName(new Name('Kono Subarashii Sekai ni Shukufuku wo! Kurenai Densetsu', 'x-jap', NameType.OFFICIAL));
        lpdld.addSeriesName(new Name('KONOSUBA -God\'s blessing on this wonderful world! Movie', 'en', NameType.MAIN));
        lpdld.addSeriesName(new Name('この素晴らしい世界に祝福を！紅伝説', 'jap', NameType.UNKNOWN));
        await series.addListProvider(lpdld);
        const result = await a.getMoreSeriesInfoByName('この素晴らしい世界に祝福を！紅伝説', -1);

        deepEqual(result[0].mainProvider.id, '13310');
    });

    test('should find id 13493', async () => {
        const a = new AniDBProvider(false);
        const lpdld = new ListProviderLocalData(9995, 'AniList');
        lpdld.episodes = 12;
        lpdld.infoStatus = ProviderInfoStatus.FULL_INFO;
        lpdld.watchStatus = WatchStatus.DROPPED;

        const series = new Series();
        // tslint:disable-next-line: no-string-literal
        series['cachedSeason'] = 3;
        lpdld.addSeriesName(new Name('Sword Art Online: Alicization', 'en', NameType.MAIN));
        await series.addListProvider(lpdld);
        const result = await a.getMoreSeriesInfoByName('Sword Art Online: Alicization', 3);

        deepEqual(result[0].mainProvider.id, '13493');
    });

    test('should find id 14977', async () => {
        const a = new AniDBProvider(false);
        const lpdld = new ListProviderLocalData(9996, 'AniList');
        lpdld.episodes = 12;
        lpdld.infoStatus = ProviderInfoStatus.FULL_INFO;

        const series = new Series();
        // tslint:disable-next-line: no-string-literal
        series['cachedSeason'] = 4;
        lpdld.addSeriesName(new Name('Shingeki no Kyojin The Final Season', 'x-jap', NameType.MAIN));
        await series.addListProvider(lpdld);
        const result = await a.getMoreSeriesInfoByName('Shingeki no Kyojin The Final Season');

        deepEqual(result[0].mainProvider.id, '14977');
    });

    test('should find id 3651', async () => {
        const a = new AniDBProvider(false);
        const lpdld = new ListProviderLocalData(9997, 'AniList');
        lpdld.episodes = 12;
        lpdld.infoStatus = ProviderInfoStatus.FULL_INFO;

        const series = new Series();
        // tslint:disable-next-line: no-string-literal
        series['cachedSeason'] = 1;
        lpdld.addSeriesName(new Name('Suzumiya Haruhi no Yuuutsu', 'x-jap', NameType.MAIN));
        lpdld.addSeriesName(new Name('The Melancholy of Haruhi Suzumiya', 'unkown', NameType.MAIN));
        lpdld.addSeriesName(new Name('涼宮ハルヒの憂鬱', 'x-jap', NameType.MAIN));
        await series.addListProvider(lpdld);
        const result = await a.getMoreSeriesInfoByName('The Melancholy of Haruhi Suzumiya', 1);

        deepEqual(result[0].mainProvider.id, '3651');
    });
    test('should find id 8550', async () => {
        const a = new AniDBProvider(false);
        const lpdld = new ListProviderLocalData(9998, 'AniList');
        lpdld.episodes = 12;
        lpdld.infoStatus = ProviderInfoStatus.FULL_INFO;

        const series = new Series();
        // tslint:disable-next-line: no-string-literal
        series['cachedSeason'] = 1;
        lpdld.addSeriesName(new Name('Hunter x Hunter (2011)', '', NameType.MAIN));
        lpdld.addSeriesName(new Name('ハンター×ハンター (2011)', 'jap', NameType.MAIN));
        await series.addListProvider(lpdld);
        const result = await a.getMoreSeriesInfoByName('Hunter x Hunter (2011)', 1);

        deepEqual(result[0].mainProvider.id, '8550');
    });

    test('should find Danshi', async () => {
        const a = new AniDBProvider(false);
        const lpdld = new ListProviderLocalData(9999, 'AniList');
        lpdld.episodes = 12;
        lpdld.infoStatus = ProviderInfoStatus.FULL_INFO;

        const series = new Series();
        // tslint:disable-next-line: no-string-literal
        series['cachedSeason'] = 1;
        lpdld.addSeriesName(new Name('Danshi Koukousei no Nichijou', NameType.MAIN));
        lpdld.addSeriesName(new Name('Daily Lives of High School Boys', 'jap', NameType.MAIN));
        lpdld.addSeriesName(new Name('男子高校生の日常', 'jap', NameType.MAIN));
        await series.addListProvider(lpdld);
        // tslint:disable-next-line: no-string-literal
        const result = await providerInfoDownloaderhelper['getProviderSeriesInfo'](series, a);
        deepEqual(result.mainProvider.id, '8729');
    });

    test('should find nothing', async () => {
        const a = new AniDBProvider(false);
        const lpdld = new ListProviderLocalData(9992, 'AniList');
        lpdld.episodes = 12;
        lpdld.infoStatus = ProviderInfoStatus.FULL_INFO;

        const series = new Series();
        // tslint:disable-next-line: no-string-literal
        series['cachedSeason'] = 1;
        lpdld.addSeriesName(new Name('Danshi Koukousei no Nichijou Specials', NameType.MAIN));
        lpdld.addSeriesName(new Name('Daily Lives of High School Boys Specials', 'jap', NameType.MAIN));
        lpdld.addSeriesName(new Name('男子高校生の日常', 'jap', NameType.MAIN));
        await series.addListProvider(lpdld);
        try {
            // tslint:disable-next-line: no-string-literal
            await providerInfoDownloaderhelper['getProviderSeriesInfo'](series, a);
            fail();
        } catch (err) {
            logger.error(err);
        }
    });

    test('should find id 5975', async () => {
        const a = new AniDBProvider(false);
        const lpdld = new ListProviderLocalData(9991, 'AniList');
        lpdld.episodes = 12;
        lpdld.infoStatus = ProviderInfoStatus.FULL_INFO;

        const series = new Series();
        // tslint:disable-next-line: no-string-literal
        series['cachedSeason'] = 1;
        lpdld.addSeriesName(new Name('Toaru Majutsu no Index', NameType.MAIN));
        await series.addListProvider(lpdld);
        const result = await a.getMoreSeriesInfoByName('Toaru Majutsu no Index', 1);

        deepEqual(result[0].mainProvider.id, '5975');
    });

    test('should find id 7599', async () => {
        const a = new AniDBProvider(false);
        const lpdld = new ListProviderLocalData(999, 'AniList');
        lpdld.episodes = 12;
        lpdld.infoStatus = ProviderInfoStatus.FULL_INFO;

        const series = new Series();
        // tslint:disable-next-line: no-string-literal
        series['cachedSeason'] = 1;
        lpdld.addSeriesName(new Name('Toaru Majutsu no Index', NameType.MAIN));
        await series.addListProvider(lpdld);
        const result = await a.getMoreSeriesInfoByName('Toaru Majutsu no Index', 2);

        deepEqual(result[0].mainProvider.id, '7599');
    });

    test('should find id 14416', async () => {
        const a = new AniDBProvider(false);
        const lpdld = new ListProviderLocalData(998, 'AniList');
        lpdld.episodes = 12;
        lpdld.infoStatus = ProviderInfoStatus.FULL_INFO;

        const series = new Series();
        // tslint:disable-next-line: no-string-literal
        series['cachedSeason'] = 1;
        lpdld.addSeriesName(new Name('Boku no Hero Academia 4', NameType.MAIN));
        await series.addListProvider(lpdld);
        const result = await a.getMoreSeriesInfoByName('My Hero Academia Season 4', 4);

        deepEqual(result[0].mainProvider.id, '14416');
    });

    test('should find id 5544', async () => {
        const a = new AniDBProvider(false);
        const lpdld = new ListProviderLocalData(997, 'AniList');
        lpdld.episodes = 12;
        lpdld.infoStatus = ProviderInfoStatus.FULL_INFO;

        const series = new Series();
        lpdld.addSeriesName(new Name('Persona -Trinity Soul-', NameType.MAIN));
        lpdld.addSeriesName(new Name(' Persona -trinity soul-', NameType.MAIN));
        lpdld.addSeriesName(new Name('ペルソナ 〜トリニティ・ソウル〜', NameType.MAIN));
        await series.addListProvider(lpdld);
        // tslint:disable-next-line: no-string-literal
        const result = await providerInfoDownloaderhelper['getProviderLocalDataByName'](series, new Name('Persona Trinity Soul', 'x-japclean'), a);

        deepEqual(result.mainProvider.id, '5544');
    });



    test('should not hang', async () => {
        const a = new AniDBProvider(false);
        const lpdld = new ListProviderLocalData(996, 'AniList');
        lpdld.episodes = 12;
        lpdld.infoStatus = ProviderInfoStatus.FULL_INFO;

        const series = new Series();
        // tslint:disable-next-line: no-string-literal
        series['cachedSeason'] = 1;
        lpdld.addSeriesName(new Name('Tokyo Ghoulre', 'jap', NameType.MAIN));
        await series.addListProvider(lpdld);
        try {
            // tslint:disable-next-line: no-string-literal
            await providerInfoDownloaderhelper['getProviderSeriesInfo'](series, a);
            fail();
        } catch (err) {
            logger.error(err);
        }
    });
});