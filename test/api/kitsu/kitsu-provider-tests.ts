import { fail, strictEqual } from 'assert';
import KitsuProvider from '../../../src/backend/api/kitsu/kitsu-provider';
import Name from '../../../src/backend/controller/objects/meta/name';
import Series from '../../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';
import providerInfoDownloaderhelper from '../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-info-downloaderhelper';
import logger from '../../../src/backend/logger/logger';
import TestProvider from '../../controller/objects/testClass/testProvider';
import TestHelper from '../../test-helper';

// tslint:disable: no-string-literal
describe('Provider: Kitsu | Test runs', () => {
    const kitsuProvider = new KitsuProvider();

    beforeEach(() => {
        TestHelper.mustHaveBefore();
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'] = [new TestProvider('', true, true), new KitsuProvider()];
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = undefined;
    });

    test('should get a series (1/6)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('Sankarea', 'en'));
        await series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await providerInfoDownloaderhelper['downloadProviderSeriesInfo'](series, kitsuProvider);
        strictEqual(result.mainProvider.providerLocalData.id, '6521');
    });

    test('should get a series (2/6)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('Seitokai Yakuindomo＊', 'en'));
        await series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await providerInfoDownloaderhelper['downloadProviderSeriesInfo'](series, kitsuProvider);
        strictEqual(result.mainProvider.providerLocalData.id, '12959');
    });

    test('should get a series (3/6)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('The Asterisk War: The Academy City on the Water', 'en'));
        await series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await providerInfoDownloaderhelper['downloadProviderSeriesInfo'](series, kitsuProvider);
        strictEqual(result.mainProvider.providerLocalData.id, '10857');
    });

    test('should get a series (4/6)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('Little Witch Academia', 'en'));
        await series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await providerInfoDownloaderhelper['downloadProviderSeriesInfo'](series, kitsuProvider);
        const kitsuResult = result.getAllProviders().find((x) => x.provider === kitsuProvider.providerName);
        if (kitsuResult) {
            strictEqual(kitsuResult.provider, kitsuProvider.providerName);
            strictEqual(kitsuResult.id, '12272');
        } else {
            fail('No kitsu result');
        }
    });

    test('should get a series (6/6)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('Naruto: Shippuuden', 'en'));
        await series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await providerInfoDownloaderhelper['downloadProviderSeriesInfo'](series, kitsuProvider);
        strictEqual(result.mainProvider.providerLocalData.id, '1555');
    });

    test('it should get a series by trakt id', async () => {
        const a = new KitsuProvider();
        const result = await a['getByTraktId'](94084);
        strictEqual(result.data[0].id, "87492");
    });
});
