import TraktProvider from '../../../../src/backend/api/information-providers/trakt/trakt-provider';
import ListProvider from '../../../../src/backend/api/provider/list-provider';
import MainListManager from '../../../../src/backend/controller/main-list-manager/main-list-manager';
import { MediaType } from '../../../../src/backend/controller/objects/meta/media-type';
import Name from '../../../../src/backend/controller/objects/meta/name';
import Series from '../../../../src/backend/controller/objects/series';
import ProviderDataListManager from '../../../../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-manager';
import { ListProviderLocalData } from '../../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import providerInfoDownloaderhelper from '../../../../src/backend/helpFunctions/provider/provider-info-downloader/download-provider-local-data-helper';
import TraktTestProvider from './trakt-test-provider';
// tslint:disable: no-string-literal
describe('Provider: Trakt | Tests runs', () => {
    beforeEach(() => {
        ProviderList['loadedListProvider'] = ProviderList['loadProviderList']([TraktTestProvider, TraktProvider] as Array<(new () => ListProvider)>);
        ProviderList['loadedInfoProvider'] = undefined;
        ProviderList['loadedMappingProvider'] = [];
    });
    describe('', () => {
        const traktProviderInstance = ProviderList.getProviderInstanceByClass(TraktProvider);
        beforeEach(() => {
            MainListManager['mainList'] = [];
            ProviderDataListManager['providerDataList'] = [];
        });

        test('should get a series (2/5)', async () => {

            const series = new Series();
            const unkownProvider = new ListProviderLocalData(-1, TraktTestProvider);
            unkownProvider.addSeriesName(new Name('Seitokai Yakuindomo＊', 'en'));

            series.addProviderDatas(unkownProvider);

            const result = await providerInfoDownloaderhelper['downloadProviderLocalData'](series, traktProviderInstance);
            expect(result.getAllProviders().length).toBe(2);
        });

        test('should get a series (3/5)', async () => {
            const series = new Series();
            const unkownProvider = new ListProviderLocalData(-1, TraktTestProvider);
            unkownProvider.addSeriesName(new Name('The Asterisk War: The Academy City on the Water', 'en'));
            series.addProviderDatas(unkownProvider);

            const result = await providerInfoDownloaderhelper['downloadProviderLocalData'](series, traktProviderInstance);
            expect(result.getAllProviders().length).toBe(2);
        });

        test('should get a series (4/5)', async () => {
            const series = new Series();
            const unkownProvider = new ListProviderLocalData(-1);
            unkownProvider.mediaType = MediaType.ANIME;
            unkownProvider.releaseYear = 2017;
            unkownProvider.addSeriesName(new Name('Little Witch Academia', 'en'));
            series.addProviderDatas(unkownProvider);

            const result = await providerInfoDownloaderhelper['downloadProviderLocalData'](series, traktProviderInstance);
            expect(result.getAllProviders().length).toBe(2);
        });

        test('should get a series (5/5)', async () => {

            const series = new Series();
            const unkownProvider = new ListProviderLocalData(-1);
            unkownProvider.releaseYear = 2005;
            unkownProvider.addSeriesName(new Name('Avatar: The Last Airbender', 'en'));
            series.addProviderDatas(unkownProvider);

            const result = await providerInfoDownloaderhelper['downloadProviderLocalData'](series, traktProviderInstance);
            expect(result.getAllProviders().length).toBe(2);
        });

        test('should get a series (6/6) same result but different year', async () => {

            const series = new Series();
            const unkownProvider = new ListProviderLocalData(-1);
            unkownProvider.addSeriesName(new Name('Yamada-kun and the Seven Witches', 'en'));
            unkownProvider.releaseYear = 2013;
            series.addProviderDatas(unkownProvider);


            const result = await providerInfoDownloaderhelper['downloadProviderLocalData'](series, traktProviderInstance);
            expect(result.mainProvider.providerLocalData.releaseYear).toBe(2013);
            expect(result.mainProvider.providerLocalData.id).toBe(72367);
        });
        test('should get a series and should mark the episodes right', async () => {
            const series = new Series();
            const unkownProvider = new ListProviderLocalData(103803, TraktProvider);
            unkownProvider.addSeriesName(new Name('Yamada-kun and the Seven Witches', 'en'));
            unkownProvider.releaseYear = 2013;
            series.addProviderDatas(unkownProvider);


            const result = await providerInfoDownloaderhelper['downloadProviderLocalData'](series, traktProviderInstance);
            expect(result.mainProvider.providerLocalData.id).toBe(103803);
            expect(result.mainProvider.providerLocalData.getDetailEpisodeInfos().length).not.toBe(0);
        });
    });
});
