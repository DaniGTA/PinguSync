import { strictEqual } from 'assert';
import OMDbProvider from '../../../src/backend/api/omdb/omdb-provider';
import Name from '../../../src/backend/controller/objects/meta/name';
import Series from '../../../src/backend/controller/objects/series';
import { InfoProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';
import providerInfoDownloaderhelper from '../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-info-downloaderhelper';
import TestProvider from '../../controller/objects/testClass/testProvider';
import TestHelper from '../../test-helper';
// tslint:disable: no-string-literal
describe('Provider: OMDb | Test runs', () => {
    const omdbProvider = new OMDbProvider();
    beforeAll(() => {
        TestHelper.mustHaveBefore();
    });

    beforeEach(() => {
        ProviderList['loadedListProvider'] = [new TestProvider('', true, true)];
        ProviderList['loadedInfoProvider'] = undefined;
        ProviderList['loadedInfoProvider'] = [omdbProvider];
    });

    test('should get a series (1/1)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('Sankarea: Undying Love', 'en'));
        await series.addProviderDatas(unkownProvider);

        const result = await providerInfoDownloaderhelper['downloadProviderSeriesInfo'](series, omdbProvider);
        strictEqual(result.getAllProviders().length, 1);
        return;
    });

    test('should not crash', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData('-1');
        unkownProvider.addSeriesName(new Name('Kono Subarashii Sekai ni Shukufuku wo Kurenai Densetsu', 'en'));
        await series.addProviderDatas(unkownProvider);

        const result = await omdbProvider.getMoreSeriesInfoByName('Kono Subarashii Sekai ni Shukufuku wo Kurenai Densetsu');
        strictEqual(result.length, 0);
        return;
    });


    test('should get series by id', async () => {
        const unkownProvider = new InfoProviderLocalData('tt2341379', OMDbProvider);
        const result = await omdbProvider.getFullInfoById(unkownProvider);
        strictEqual(result.mainProvider.providerLocalData.id, unkownProvider.id);
        return;
    });

});
