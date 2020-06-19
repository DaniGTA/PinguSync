import ProviderDataListManager from '../../../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-manager';
import ProviderDataListSearcher from '../../../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-searcher';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-controller/provider-manager/provider-list';


describe('Provider data list searcher tests', () => {
    beforeEach(() => {
        // tslint:disable: no-string-literal
        ProviderList['loadedListProvider'] = [];
        ProviderList['loadedInfoProvider'] = [];
    });

    test('find one provider with id and provider name', () => {
        ProviderDataListManager['providerDataList'].push(new ListProviderLocalData(1, 'test'));
        const result1 = ProviderDataListSearcher.getOneProviderLocalData(1, 'test');
        const result2 = ProviderDataListSearcher.getOneProviderLocalData(2, 'test');

        expect(result1).not.toBe(null);
        expect(result2).toBe(null);
    });
});
