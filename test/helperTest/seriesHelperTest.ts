import Series from "../../src/backend/controller/objects/series";
import seriesHelper from '../../src/backend/helpFunctions/series-helper';
import { strictEqual } from 'assert';
import { InfoProviderLocalData } from '../../src/backend/controller/objects/info-provider-local-data';
import { ListProviderLocalData } from '../../src/backend/controller/objects/list-provider-local-data';
import Name from '../../src/backend/controller/objects/meta/name';
import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager';
import MainListLoader from '../../src/backend/controller/main-list-manager/main-list-loader';
import ProviderList from '../../src/backend/controller/provider-manager/provider-list';
import TestProvider from '../controller/objects/testClass/testProvider';
import ListController from '../../src/backend/controller/list-controller';

describe('seriesHelperTest', () => {
    var lc = new ListController(true);

    before(() => {
        MainListManager['listLoaded'] = true;
        MainListLoader['loadData'] = () => { return [] };
        MainListLoader['saveData'] = async () => { };
    })
    beforeEach(() => {
        ProviderList['loadedListProvider'] = [new TestProvider("test",true,false),new TestProvider("test2",true,true)];
        ProviderList['loadedInfoProvider'] = [];
        MainListManager['mainList'] = [];
    })
    it('should not detect as same series', async () => {
        var a = new Series();
        a['cachedSeason'] = 2;
        a['canSync'] = false;
        // A is should not match with any of them.
        var infoProvider = new InfoProviderLocalData("test3");
        infoProvider.id = "14792";
        a.addInfoProvider(infoProvider);
        a.isNSFW = false;
        var listProvider = new ListProviderLocalData("test2");
        listProvider.id = 108632;
        listProvider.targetSeason = 2;
        listProvider.fullInfo = true;
        listProvider.prequelIds.push(21355);
        a.addListProvider(listProvider);
        a.addSeriesName(new Name("Test 2", "x-jap"));
        // B is related too C
        var b = new Series();
        b['cachedSeason'] = 1;
        b['canSync'] = false;
        b.isNSFW = false;
        var infoProvider = new InfoProviderLocalData("test4");
        infoProvider.fullInfo = true;
        infoProvider.id = 260449;
        a.addInfoProvider(infoProvider);
        var listProvider = new ListProviderLocalData("test");
        listProvider.id = 43973;
        listProvider.targetSeason = 1;
        listProvider.fullInfo = true;
        b.addListProvider(listProvider);
        b.releaseYear  = 2013
        b.addSeriesName(new Name("Test", "x-jap"));


        MainListManager['mainList'] = [a, b];

        var c = new Series();
        c['cachedSeason'] = 2;
        c['canSync'] = false;
        c.isNSFW = false;
        var listProvider =
         new ListProviderLocalData("test");
        listProvider.id = 43973;
        listProvider.targetSeason = 2;
        listProvider.fullInfo = true;
        c.addListProvider(listProvider);
        c.addSeriesName(new Name("Series Test", "x-jap"));

        strictEqual(await seriesHelper.isSameSeries(a, c), false);
    });
});