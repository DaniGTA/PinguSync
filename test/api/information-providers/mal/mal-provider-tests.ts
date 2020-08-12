import MalProvider from '../../../../src/backend/api/information-providers/mal/mal-provider';
import ExternalProvider from '../../../../src/backend/api/provider/external-provider';
import ListProvider from '../../../../src/backend/api/provider/list-provider';
import ProviderDataListManager from '../../../../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-manager';
import { InfoProviderLocalData } from '../../../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import ProviderList from '../../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import MalTestProvider from './mal-test-provider';

describe('Provider: Mal | Test runs', () => {
    const malProvider = new MalProvider();

    beforeAll(() => {
        (ExternalProvider.prototype.waitUntilItCanPerfomNextRequest as unknown as jest.SpyInstance<Promise<void>, []>).mockRestore();
    });

    beforeEach(() => {
        ProviderList['loadedListProvider'] = ProviderList['loadProviderList']([MalProvider, MalTestProvider] as Array<(new () => ListProvider)>);
        ProviderList['loadedMappingProvider'] = [];
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = [];
        ProviderDataListManager['providerDataList'] = [];
    });

    test('get info by id', async () => {
        //const result = await malProvider.getFullInfoById(new InfoProviderLocalData(11757));
    });
});