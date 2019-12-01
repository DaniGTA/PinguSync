import { strictEqual } from 'assert';
import TraktProvider from '../../../src/backend/api/trakt/trakt-provider';
import Name from '../../../src/backend/controller/objects/meta/name';
import Series from '../../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';
import providerInfoDownloaderhelper from '../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-info-downloaderhelper';
import TestHelper from '../../test-helper';
// tslint:disable: no-string-literal
describe('Provider: Trakt | Tests runs', () => {
    const traktProvider = new TraktProvider();

    before(() => {
        TestHelper.mustHaveBefore();
        ProviderList['loadedListProvider'] = undefined;
        ProviderList['loadedInfoProvider'] = undefined;
    });

    it('should get a series (2/5)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('Seitokai Yakuindomo＊', 'en'));
        await series.addProviderDatas(unkownProvider);

        const result = await providerInfoDownloaderhelper['getProviderSeriesInfo'](series, traktProvider);
        strictEqual(result.getAllProviders().length, 2);
    });

    it('should get a series (3/5)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('The Asterisk War: The Academy City on the Water', 'en'));
        await series.addProviderDatas(unkownProvider);

        const result = await providerInfoDownloaderhelper['getProviderSeriesInfo'](series, traktProvider);
        strictEqual(result.getAllProviders().length, 2);
    });

    it('should get a series (4/5)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('Little Witch Academia', 'en'));
        await series.addProviderDatas(unkownProvider);

        const result = await providerInfoDownloaderhelper['getProviderSeriesInfo'](series, traktProvider);
        strictEqual(result.getAllProviders().length, 2);
    });

    it('should get a series (5/5)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('Avatar: The Last Airbender', 'en'));
        await series.addProviderDatas(unkownProvider);

        const result = await providerInfoDownloaderhelper['getProviderSeriesInfo'](series, traktProvider);
        strictEqual(result.getAllProviders().length, 2);
    });

    it('should get a series (6/6) same result but different year', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('Yamada-kun and the Seven Witches', 'en'));
        unkownProvider.releaseYear = 2013;
        await series.addProviderDatas(unkownProvider);


        const result = await providerInfoDownloaderhelper['getProviderSeriesInfo'](series, traktProvider);
        strictEqual(result.getAllProviders()[1].releaseYear, 2013);
        strictEqual(result.getAllProviders()[1].id, 72367);
    });

});
