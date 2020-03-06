import { notStrictEqual, strictEqual } from 'assert';
import TraktProvider from '../../../src/backend/api/trakt/trakt-provider';
import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import { MediaType } from '../../../src/backend/controller/objects/meta/media-type';
import Name from '../../../src/backend/controller/objects/meta/name';
import Series from '../../../src/backend/controller/objects/series';
import ProviderDataListManager from '../../../src/backend/controller/provider-data-list-manager/provider-data-list-manager';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';
import providerInfoDownloaderhelper from '../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-info-downloaderhelper';
import TestProvider from '../../controller/objects/testClass/testProvider';
// tslint:disable: no-string-literal
describe('Provider: Trakt | Tests runs', () => {
    const traktProvider = new TraktProvider();

    beforeEach(() => {
        ProviderList['loadedListProvider'] = [new TestProvider('', true, true), new TraktProvider()];
        ProviderList['loadedInfoProvider'] = undefined;
        MainListManager['mainList'] = [];
        ProviderDataListManager['providerDataList'] = [];
    });

    test('should get a series (2/5)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('Seitokai Yakuindomo＊', 'en'));

        await series.addProviderDatas(unkownProvider);

        const result = await providerInfoDownloaderhelper['downloadProviderSeriesInfo'](series, traktProvider);
        strictEqual(result.getAllProviders().length, 2);
    });

    test('should get a series (3/5)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('The Asterisk War: The Academy City on the Water', 'en'));
        await series.addProviderDatas(unkownProvider);

        const result = await providerInfoDownloaderhelper['downloadProviderSeriesInfo'](series, traktProvider);
        strictEqual(result.getAllProviders().length, 2);
    });

    test('should get a series (4/5)', async () => {
        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.mediaType = MediaType.ANIME;
        unkownProvider.releaseYear = 2017;
        unkownProvider.addSeriesName(new Name('Little Witch Academia', 'en'));
        await series.addProviderDatas(unkownProvider);

        const result = await providerInfoDownloaderhelper['downloadProviderSeriesInfo'](series, traktProvider);
        strictEqual(result.getAllProviders().length, 2);
    });

    test('should get a series (5/5)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.releaseYear = 2005;
        unkownProvider.addSeriesName(new Name('Avatar: The Last Airbender', 'en'));
        await series.addProviderDatas(unkownProvider);

        const result = await providerInfoDownloaderhelper['downloadProviderSeriesInfo'](series, traktProvider);
        strictEqual(result.getAllProviders().length, 2);
    });

    test('should get a series (6/6) same result but different year', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('Yamada-kun and the Seven Witches', 'en'));
        unkownProvider.releaseYear = 2013;
        await series.addProviderDatas(unkownProvider);


        const result = await providerInfoDownloaderhelper['downloadProviderSeriesInfo'](series, traktProvider);
        strictEqual(result.mainProvider.providerLocalData.releaseYear, 2013);
        strictEqual(result.mainProvider.providerLocalData.id, 72367);
    });
    test('should get a series and should mark the episodes right', async () => {
        const series = new Series();
        const unkownProvider = new ListProviderLocalData(103803, TraktProvider.getInstance().providerName);
        unkownProvider.addSeriesName(new Name('Yamada-kun and the Seven Witches', 'en'));
        unkownProvider.releaseYear = 2013;
        await series.addProviderDatas(unkownProvider);


        const result = await providerInfoDownloaderhelper['downloadProviderSeriesInfo'](series, traktProvider);
        strictEqual(result.mainProvider.providerLocalData.id, 103803);
        notStrictEqual(result.mainProvider.providerLocalData.detailEpisodeInfo.length, 0);
    });
});
