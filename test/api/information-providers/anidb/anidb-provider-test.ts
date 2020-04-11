
import { deepEqual } from 'assert';
import AniDBProvider from '../../../../src/backend/api/information-providers/anidb/anidb-provider';
import { InfoProviderLocalData } from '../../../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import ProviderList from '../../../../src/backend/controller/provider-controller/provider-manager/provider-list';

describe('Provider: AniDB | Online Test runs', () => {

    beforeAll(() => {
        // tslint:disable: no-string-literal
        ProviderList['loadedListProvider'] = undefined;
        ProviderList['loadedMappingProvider'] = [];
    });

    test('should get id 14444', async () => {
        const a = new AniDBProvider(false);
        const lpdld = new InfoProviderLocalData(14444, a.providerName);

        const result = await a.getFullInfoById(lpdld);

        deepEqual(result.mainProvider.providerLocalData.id, '14444');
    });

});
