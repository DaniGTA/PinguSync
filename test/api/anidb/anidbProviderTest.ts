
import { deepEqual } from 'assert';
import AniDBProvider from '../../../src/backend/api/anidb/anidb-provider';
import MainListLoader from '../../../src/backend/controller/main-list-manager/main-list-loader';
import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import { InfoProviderLocalData } from '../../../src/backend/controller/objects/info-provider-local-data';

describe('Provider: AniDB | Online Test runs', () => {
    before(() => {
        // tslint:disable-next-line: no-string-literal
        MainListManager['listLoaded'] = true;
        // tslint:disable-next-line: no-string-literal
        MainListLoader['loadData'] = () => [];
        // tslint:disable-next-line: no-string-literal tslint:disable-next-line: no-empty
        MainListLoader['saveData'] = async () => { };
    });
    it('should get id 14444', async () => {
        const a = new AniDBProvider(false);
        const lpdld = new InfoProviderLocalData(a.providerName);
        lpdld.id = 14444;

        const result = await a.getFullInfoById(lpdld);

        deepEqual(result.mainProvider.id, '14444');
    });

});
