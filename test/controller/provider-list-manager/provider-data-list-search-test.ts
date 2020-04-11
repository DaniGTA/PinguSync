import { notStrictEqual, strictEqual } from 'assert';
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

    test('find one provider with id and provider name', async () => {
        ProviderDataListManager['providerDataList'].push(new ListProviderLocalData(1, 'test'));
        const result1 = await ProviderDataListSearcher.getOneProviderLocalData(1, 'test');
        const result2 = await ProviderDataListSearcher.getOneProviderLocalData(2, 'test');

        notStrictEqual(result1, null);
        strictEqual(result2, null);
    });
});
