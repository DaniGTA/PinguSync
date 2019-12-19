
import { deepEqual } from 'assert';
import AniDBProvider from '../../../src/backend/api/anidb/anidb-provider';
import { InfoProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/info-provider-local-data';
import TestHelper from '../../test-helper';


describe('Provider: AniDB | Online Test runs', () => {
    before(() => {
        TestHelper.mustHaveBefore();
    });
   it('should get id 14444', async () => {
        const a = new AniDBProvider(false);
        const lpdld = new InfoProviderLocalData(14444, a.providerName);

        const result = await a.getFullInfoById(lpdld);

        deepEqual(result.mainProvider.id, '14444');
    });

});
