import { strictEqual } from 'assert';
import ListController from '../../src/backend/controller/list-controller';
import MainListLoader from '../../src/backend/controller/main-list-manager/main-list-loader';
import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager';
import Name from '../../src/backend/controller/objects/meta/name';
import Series from '../../src/backend/controller/objects/series';
import { InfoProviderLocalData } from '../../src/backend/controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../src/backend/controller/provider-manager/provider-list';
import seriesHelper from '../../src/backend/helpFunctions/series-helper';
import TestProvider from '../controller/objects/testClass/testProvider';
import { ProviderInfoStatus } from '../../src/backend/controller/provider-manager/local-data/interfaces/provider-info-status';


describe('Series Helper', () => {

    before(() => {
        // tslint:disable-next-line: no-unused-expression
        new ListController(true);
        // tslint:disable-next-line: no-string-literal
        MainListManager['listLoaded'] = true;
        // tslint:disable-next-line: no-string-literal
        MainListLoader['loadData'] = () => [];
        // tslint:disable-next-line: no-string-literal tslint:disable-next-line: no-empty
        MainListLoader['saveData'] = async () => { };
    });
    beforeEach(() => {
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'] = [new TestProvider('test', true, false), new TestProvider('test2', true, true)];
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = [];
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [];
        // tslint:disable-next-line: no-unused-expression
        new ListController(true);
    });
    it('should not detect as same series', async () => {
        const a = new Series();
        // tslint:disable-next-line: no-string-literal
        a['cachedSeason'] = 2;
        // tslint:disable-next-line: no-string-literal
        a['canSync'] = false;
        // A is should not match with any of them.
        const infoProviderA = new InfoProviderLocalData('14792', 'test3');
        a.addInfoProvider(infoProviderA);
        const listProviderA = new ListProviderLocalData(108632, 'test2');
        listProviderA.targetSeason = 2;
        listProviderA.infoStatus = ProviderInfoStatus.FULL_INFO;
        listProviderA.prequelIds.push(21355);
        listProviderA.isNSFW = false;
        listProviderA.addSeriesName(new Name('Test 2', 'x-jap'));
        a.addListProvider(listProviderA);
        // B is related too C
        const b = new Series();
        // tslint:disable-next-line: no-string-literal
        b['cachedSeason'] = 1;
        // tslint:disable-next-line: no-string-literal
        b['canSync'] = false;
        const infoProviderB = new InfoProviderLocalData(260449, 'test4');
        infoProviderB.infoStatus = ProviderInfoStatus.FULL_INFO;
        a.addInfoProvider(infoProviderB);
        const listProvider = new ListProviderLocalData(43973, 'test');
        listProvider.targetSeason = 1;
        listProvider.infoStatus = ProviderInfoStatus.FULL_INFO;
        listProvider.releaseYear = 2013;
        listProvider.isNSFW = false;
        listProvider.addSeriesName(new Name('Test', 'x-jap'));
        b.addListProvider(listProvider);

        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [a, b];

        const c = new Series();
        // tslint:disable-next-line: no-string-literal
        c['cachedSeason'] = 2;
        // tslint:disable-next-line: no-string-literal
        c['canSync'] = false;
        const listProviderB = new ListProviderLocalData(43973, 'test');
        listProviderB.isNSFW = false;
        listProviderB.targetSeason = 2;
        listProviderB.infoStatus = ProviderInfoStatus.FULL_INFO;
        listProviderB.addSeriesName(new Name('Series Test', 'x-jap'));
        c.addListProvider(listProviderB);

        strictEqual(await seriesHelper.isSameSeries(a, c), false);
    });
});
