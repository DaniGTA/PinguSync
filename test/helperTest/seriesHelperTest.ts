import { strictEqual } from 'assert';
import ListController from '../../src/backend/controller/list-controller';
import MainListLoader from '../../src/backend/controller/main-list-manager/main-list-loader';
import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager';
import { InfoProviderLocalData } from '../../src/backend/controller/objects/info-provider-local-data';
import { ListProviderLocalData } from '../../src/backend/controller/objects/list-provider-local-data';
import Name from '../../src/backend/controller/objects/meta/name';
import Series from '../../src/backend/controller/objects/series';
import ProviderList from '../../src/backend/controller/provider-manager/provider-list';
import seriesHelper from '../../src/backend/helpFunctions/series-helper';
import TestProvider from '../controller/objects/testClass/testProvider';

describe('Series Helper', () => {

    before(() => {
        // tslint:disable-next-line: no-unused-expression
        new ListController(true);
        MainListManager['listLoaded'] = true;
        MainListLoader['loadData'] = () => { return []; };
        MainListLoader['saveData'] = async () => { };
    });
    beforeEach(() => {
        ProviderList['loadedListProvider'] = [new TestProvider('test', true, false), new TestProvider('test2', true, true)];
        ProviderList['loadedInfoProvider'] = [];
        MainListManager['mainList'] = [];
        new ListController(true);
    });
    it('should not detect as same series', async () => {
        const a = new Series();
        a['cachedSeason'] = 2;
        a['canSync'] = false;
        // A is should not match with any of them.
        const infoProviderA = new InfoProviderLocalData('test3');
        infoProviderA.id = '14792';
        a.addInfoProvider(infoProviderA);
        const listProviderA = new ListProviderLocalData('test2');
        listProviderA.id = 108632;
        listProviderA.targetSeason = 2;
        listProviderA.hasFullInfo = true;
        listProviderA.prequelIds.push(21355);
        listProviderA.isNSFW = false;
        listProviderA.addSeriesName(new Name('Test 2', 'x-jap'));
        a.addListProvider(listProviderA);
        // B is related too C
        const b = new Series();
        b['cachedSeason'] = 1;
        b['canSync'] = false;
        const infoProviderB = new InfoProviderLocalData('test4');
        infoProviderB.hasFullInfo = true;
        infoProviderB.id = 260449;
        a.addInfoProvider(infoProviderB);
        const listProvider = new ListProviderLocalData('test');
        listProvider.id = 43973;
        listProvider.targetSeason = 1;
        listProvider.hasFullInfo = true;
        listProvider.releaseYear = 2013;
        listProvider.isNSFW = false;
        listProvider.addSeriesName(new Name('Test', 'x-jap'));
        b.addListProvider(listProvider);


        MainListManager['mainList'] = [a, b];

        const c = new Series();
        c['cachedSeason'] = 2;
        c['canSync'] = false;
        const listProviderB =
            new ListProviderLocalData('test');
        listProviderB.isNSFW = false;
        listProviderB.id = 43973;
        listProviderB.targetSeason = 2;
        listProviderB.hasFullInfo = true;
        listProviderB.addSeriesName(new Name('Series Test', 'x-jap'));
        c.addListProvider(listProviderB);

        strictEqual(await seriesHelper.isSameSeries(a, c), false);
    });
});
