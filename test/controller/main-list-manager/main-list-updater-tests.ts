import ListController from '../../../src/backend/controller/list-controller';

import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';

import MainListLoader from '../../../src/backend/controller/main-list-manager/main-list-loader';

import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';

import { strictEqual } from 'assert';
import MultiProviderResult from '../../../src/backend/api/multi-provider-result';
import MainListEntryUpdater from '../../../src/backend/controller/main-list-manager/main-list-updater';
import { ListProviderLocalData } from '../../../src/backend/controller/objects/list-provider-local-data';
import Series from '../../../src/backend/controller/objects/series';
import TestProvider from '../objects/testClass/testProvider';

describe('MainList | Entry update tests', () => {
    const lc = new ListController(true);

    before(() => {
        // tslint:disable-next-line: no-string-literal
        MainListManager['listLoaded'] = true;
        // tslint:disable-next-line: no-string-literal
        MainListLoader['loadData'] = () => [];
        // tslint:disable-next-line: no-string-literal tslint:disable-next-line: no-empty
        MainListLoader['saveData'] = async () => { };
    });
    beforeEach(() => {
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'] = [new TestProvider('Test'), new TestProvider('')];
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = [];
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [];
    });

    it('should update provider', async () => {
        const seriesA = new Series();
        const providerA = new ListProviderLocalData('Test');
        providerA.id = 'test';
        await seriesA.addProviderDatas(providerA);

        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [seriesA];

        const providerB = new ListProviderLocalData('Test');
        providerB.id = 'test';
        providerB.episodes = 10;
        const mpr = new MultiProviderResult(providerB);

        // Testing
        await new MainListEntryUpdater().updateProviders(mpr);

        // tslint:disable-next-line: no-string-literal
        strictEqual(MainListManager['mainList'].length, 1);
        // tslint:disable-next-line: no-string-literal
        strictEqual(MainListManager['mainList'][0].getMaxEpisode(), 10);
    });
});
