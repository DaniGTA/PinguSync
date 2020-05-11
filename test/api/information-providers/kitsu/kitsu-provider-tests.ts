import KitsuProvider from '../../../../src/backend/api/information-providers/kitsu/kitsu-provider';
import ExternalProvider from '../../../../src/backend/api/provider/external-provider';
import ListProvider from '../../../../src/backend/api/provider/list-provider';
import { MediaType } from '../../../../src/backend/controller/objects/meta/media-type';
import Name from '../../../../src/backend/controller/objects/meta/name';
import Season from '../../../../src/backend/controller/objects/meta/season';
import Series from '../../../../src/backend/controller/objects/series';
import ProviderDataListManager from '../../../../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-manager';
import { ListProviderLocalData } from '../../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import downloadProviderLocalDataHelper from '../../../../src/backend/helpFunctions/provider/provider-info-downloader/download-provider-local-data-helper';
import KitsuTestProvider from './kitsu-test-provider';
// tslint:disable: no-string-literal
describe('Provider: Kitsu | Test runs', () => {
    const kitsuProvider = new KitsuProvider();

    beforeAll(() => {
        (ExternalProvider.prototype.waitUntilItCanPerfomNextRequest as unknown as jest.SpyInstance<Promise<void>, []>).mockRestore();
    });

    beforeEach(() => {
        ProviderList['loadedListProvider'] = ProviderList['loadProviderList']([KitsuProvider, KitsuTestProvider] as Array<(new () => ListProvider)>);
        ProviderList['loadedMappingProvider'] = [];
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = [];
        ProviderDataListManager['providerDataList'] = [];
    });

    test('should get a series (1/6)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('Sankarea', 'en'));
        await series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await downloadProviderLocalDataHelper.downloadProviderLocalData(series, kitsuProvider);
        expect(result.mainProvider.providerLocalData.id).toEqual('6521');
    });

    test('should get a series (2/6)', async () => {
        const series = new Series();
        series['cachedSeason'] = new Season(2);

        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('Seitokai Yakuindomo＊', 'en'));
        await series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await downloadProviderLocalDataHelper.downloadProviderLocalData(series, kitsuProvider);
        expect(result.mainProvider.providerLocalData.id).toEqual('8061');
    });

    test('should get a series (3/6)', async () => {

        const series = new Series();
        series['cachedSeason'] = new Season(1);
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('The Asterisk War: The Academy City on the Water', 'en'));
        await series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await downloadProviderLocalDataHelper.downloadProviderLocalData(series, kitsuProvider);
        expect(result.mainProvider.providerLocalData.id).toEqual('10857');
    });

    test('should get a series (4/6)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.mediaType = MediaType.ANIME;
        unkownProvider.addSeriesName(new Name('Little Witch Academia', 'en'));
        await series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await downloadProviderLocalDataHelper.downloadProviderLocalData(series, kitsuProvider);
        const kitsuResult = result.mainProvider;

        expect(kitsuResult.providerLocalData.provider).toEqual(kitsuProvider.providerName);
        expect(kitsuResult.providerLocalData.id).toEqual('12272');
    }, 5000);

    test('should get the series: 1555', async () => {


        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.mediaType = MediaType.ANIME;
        unkownProvider.addSeriesName(new Name('Naruto: Shippuuden', 'en'));
        await series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await downloadProviderLocalDataHelper.downloadProviderLocalData(series, kitsuProvider);
        const kitsuResult = result.mainProvider;

        expect(kitsuResult.providerLocalData.provider).toEqual(kitsuProvider.providerName);
        expect(kitsuResult.providerLocalData.id).toEqual('1555');
    }, 5000);

    test('should get the series: 11578', async () => {


        const series = new Series();
        const unkownProvider = new ListProviderLocalData(11578, KitsuProvider);
        await series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await downloadProviderLocalDataHelper.downloadProviderLocalData(series, kitsuProvider);
        const kitsuResult = result.mainProvider;

        expect(kitsuResult.providerLocalData.provider).toEqual(kitsuProvider.providerName);
        expect(kitsuResult.providerLocalData.id).toEqual('11578');
    }, 5000);

    test('it should get a series by trakt id', async () => {
        const a = new KitsuProvider();
        const result = await a['getByTraktId'](94084);
        expect(result.data[0].id).toEqual('87492');
    });
});
