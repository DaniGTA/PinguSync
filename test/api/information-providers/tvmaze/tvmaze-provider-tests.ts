

import { strictEqual } from 'assert';
import TVMazeProvider from '../../../../src/backend/api/information-providers/tvmaze/tvmaze-provider';
import InfoProvider from '../../../../src/backend/api/provider/info-provider';
import ListProvider from '../../../../src/backend/api/provider/list-provider';
import Name from '../../../../src/backend/controller/objects/meta/name';
import Series from '../../../../src/backend/controller/objects/series';
import { InfoProviderLocalData } from '../../../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import ProviderLoader from '../../../../src/backend/controller/provider-controller/provider-manager/provider-loader';
import providerInfoDownloaderhelper from '../../../../src/backend/helpFunctions/provider/provider-info-downloader/download-provider-local-data-helper';
import TestProvider from '../../../controller/objects/testClass/testProvider';
import TVMazeTestProvider from './tvmaze-tets-provider';
import downloadProviderLocalDataHelper from '../../../../src/backend/helpFunctions/provider/provider-info-downloader/download-provider-local-data-helper';

// tslint:disable: no-string-literal
describe('Provider: TVMaze | Test runs', () => {
    beforeEach(() => {
        ProviderList['loadedListProvider'] = ProviderList['loadProviderList']([TVMazeTestProvider] as Array<(new () => ListProvider)>);
        ProviderList['loadedInfoProvider'] = ProviderList['loadProviderList']([TVMazeProvider] as Array<(new () => InfoProvider)>);
        ProviderList['loadedMappingProvider'] = [];
        (ProviderLoader.prototype as any).listOfListProviders = [TestProvider];
        (ProviderLoader.prototype as any).listOfInfoProviders = [TVMazeProvider];
    });

    test('should get a series (1/5)', async () => {
        const providerInstance = ProviderList.getProviderInstanceByClass(TVMazeProvider);
        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('Sankarea', 'en'));
        await series.addProviderDatas(unkownProvider);

        const result = await downloadProviderLocalDataHelper.downloadProviderLocalData(series, providerInstance);
        strictEqual(result.getAllProviders().length, 2);
        return;
    });
    test('should get series by id', async () => {
        const providerInstance = ProviderList.getProviderInstanceByClass(TVMazeProvider);
        const unkownProvider = new InfoProviderLocalData(1505, '');
        const result = await providerInstance.getFullInfoById(unkownProvider);
        strictEqual(result.mainProvider.providerLocalData.id, unkownProvider.id);
        return;
    });

});
