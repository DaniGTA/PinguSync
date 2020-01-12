

import { fail, strictEqual } from 'assert';
import KitsuProvider from '../../../src/backend/api/kitsu/kitsu-provider';
import Name from '../../../src/backend/controller/objects/meta/name';
import Series from '../../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';
import providerInfoDownloaderhelper from '../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-info-downloaderhelper';
import TestHelper from '../../test-helper';

// tslint:disable: no-string-literal
describe('Provider: Kitsu | Test runs', () => {
    const kitsuProvider = new KitsuProvider();

    beforeEach(() => {
        TestHelper.mustHaveBefore();
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'] = undefined;
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = undefined;
    });

    test('should get a series (1/6)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('Sankarea', 'en'));
        await series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await providerInfoDownloaderhelper['getProviderSeriesInfo'](series, kitsuProvider);
        strictEqual(result.mainProvider.providerLocalData.id, '6521');
    });

    test('should get a series (2/6)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('Seitokai Yakuindomo＊', 'en'));
        await series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await providerInfoDownloaderhelper['getProviderSeriesInfo'](series, kitsuProvider);
        strictEqual(result.mainProvider.providerLocalData.id, '12959');
    });

    test('should get a series (3/6)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('The Asterisk War: The Academy City on the Water', 'en'));
        await series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await providerInfoDownloaderhelper['getProviderSeriesInfo'](series, kitsuProvider);
        strictEqual(result.mainProvider.providerLocalData.id, '10857');
    });

    test('should get a series (4/6)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('Little Witch Academia', 'en'));
        await series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await providerInfoDownloaderhelper['getProviderSeriesInfo'](series, kitsuProvider);
        const kitsuResult = result.getAllProviders().find((x) => x.providerLocalData.provider === kitsuProvider.providerName);
        if (kitsuResult) {
            strictEqual(kitsuResult.providerLocalData.provider, kitsuProvider.providerName);
            strictEqual(kitsuResult.providerLocalData.id, '12272');
        } else {
            fail('No kitsu result');
        }
    });

    test('should get a series (5/6)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('Avatar: The Last Airbender', 'en'));
        await series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await providerInfoDownloaderhelper['getProviderSeriesInfo'](series, kitsuProvider);
        strictEqual(result.mainProvider.providerLocalData.id, 5);
    });

    test('should get a series (6/6)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('Naruto: Shippuuden', 'en'));
        await series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await providerInfoDownloaderhelper['getProviderSeriesInfo'](series, kitsuProvider);
        strictEqual(result.mainProvider.providerLocalData.id, '1555');
    });

});
