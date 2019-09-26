
import { deepEqual } from 'assert';
import AniDBProvider from '../../../src/backend/api/anidb/anidb-provider';
import Series from '../../../src/backend/controller/objects/series';
import { InfoProviderLocalData } from '../../../src/backend/controller/objects/info-provider-local-data';

describe('AniDB Provider Tests', () => {
    it('should get id 14977', async () => {
        var a = new AniDBProvider(false); 
        const lpdld = new InfoProviderLocalData(a.providerName);
        lpdld.id = 21978;

        const result = await a.getFullInfoById(lpdld);
        
        deepEqual(result.mainProvider.id,'14977');
    });

});
