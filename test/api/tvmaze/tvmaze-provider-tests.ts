

import { strictEqual } from 'assert';
import TVMazeProvider from '../../../src/backend/api/tvmaze/tvmaze-provider';
import Name from '../../../src/backend/controller/objects/meta/name';
import Series from '../../../src/backend/controller/objects/series';
import { InfoProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';
import providerInfoDownloaderhelper from '../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-info-downloaderhelper';
import TestProvider from '../../controller/objects/testClass/testProvider';

// tslint:disable: no-string-literal
describe('Provider: TVMaze | Test runs', () => {
    const tvmazeProvider = new TVMazeProvider();

    beforeEach(() => {
        ProviderList['loadedListProvider'] = [new TestProvider('', true, true)];
        ProviderList['loadedInfoProvider'] = [tvmazeProvider];
    });

    test('should get a series (1/5)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1, '');
        unkownProvider.addSeriesName(new Name('Sankarea', 'en'));
        await series.addProviderDatas(unkownProvider);

        const result = await providerInfoDownloaderhelper['downloadProviderSeriesInfo'](series, tvmazeProvider);
        strictEqual(result.getAllProviders().length, 2);
        return;
    });
    test('should get series by id', async () => {
        const unkownProvider = new InfoProviderLocalData(1505, '');
        const result = await tvmazeProvider.getFullInfoById(unkownProvider);
        strictEqual(result.mainProvider.providerLocalData.id, unkownProvider.id);
        return;
    });

});
