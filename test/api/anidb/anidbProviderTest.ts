
import { deepEqual } from 'assert';
import AniDBProvider from '../../../src/backend/api/anidb/anidb-provider';
import { InfoProviderLocalData } from '../../../src/backend/controller/objects/info-provider-local-data';

describe('AniDB Provider Tests', () => {
    it('should get id 14444', async () => {
        var a = new AniDBProvider(false); 
        const lpdld = new InfoProviderLocalData(a.providerName);
        lpdld.id = 14444;

        const result = await a.getFullInfoById(lpdld);
        
        deepEqual(result.mainProvider.id,'14444');
    });

});
