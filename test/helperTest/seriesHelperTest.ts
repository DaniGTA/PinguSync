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
import { MediaType } from '../../src/backend/controller/objects/meta/media-type';

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
        new ListController(true);
    })
    it('should not detect as same series', async () => {
        var a = new Series();
        a['cachedSeason'] = 2;
        a['canSync'] = false;
        // A is should not match with any of them.
        var infoProvider = new InfoProviderLocalData("test3");
        infoProvider.id = "14792";
        a.addInfoProvider(infoProvider);
        var listProvider = new ListProviderLocalData("test2");
        listProvider.id = 108632;
        listProvider.targetSeason = 2;
        listProvider.fullInfo = true;
        listProvider.prequelIds.push(21355);
        listProvider.isNSFW = false;
        listProvider.addSeriesName(new Name("Test 2", "x-jap"));
        a.addListProvider(listProvider);
        // B is related too C
        var b = new Series();
        b['cachedSeason'] = 1;
        b['canSync'] = false;
        var infoProvider = new InfoProviderLocalData("test4");
        infoProvider.fullInfo = true;
        infoProvider.id = 260449;
        a.addInfoProvider(infoProvider);
        var listProvider = new ListProviderLocalData("test");
        listProvider.id = 43973;
        listProvider.targetSeason = 1;
        listProvider.fullInfo = true;
        listProvider.releaseYear = 2013;
        listProvider.isNSFW = false;
        listProvider.addSeriesName(new Name("Test", "x-jap"));
        b.addListProvider(listProvider);


        MainListManager['mainList'] = [a, b];

        var c = new Series();
        c['cachedSeason'] = 2;
        c['canSync'] = false;
        var listProvider =
        new ListProviderLocalData("test");
        listProvider.isNSFW = false;
        listProvider.id = 43973;
        listProvider.targetSeason = 2;
        listProvider.fullInfo = true;
        listProvider.addSeriesName(new Name("Series Test", "x-jap"));
        c.addListProvider(listProvider);

        strictEqual(await seriesHelper.isSameSeries(a, c), false);
    });

    it('should get the right season value: 1', async () => {
        const a = new Series();
        const listProvider = new ListProviderLocalData("test2");
        listProvider.id = 1;
        listProvider.mediaType = MediaType.ANIME;
        listProvider.prequelIds.push(2);
        listProvider.addSeriesName(new Name("Test", "x-jap"));
        a.addListProvider(listProvider);

        const b = new Series();  
        const listProvider2 = new ListProviderLocalData("test2");
        listProvider2.id = 2;
        listProvider2.mediaType = MediaType.SPECIAL;
        listProvider2.addSeriesName(new Name("Test", "x-jap"));
        b.addListProvider(listProvider2);

        MainListManager['mainList'] = [a, b];
        const result = await seriesHelper.searchSeasonValue(a);
        console.log(result.foundType);
        strictEqual(result.season,1);
    });

    it('should get the right season value: 2', async () => {
        const a = new Series();
        const listProvider = new ListProviderLocalData("test2");
        listProvider.id = 1;
        listProvider.mediaType = MediaType.ANIME;
        listProvider.prequelIds.push(2);
        listProvider.addSeriesName(new Name("Test", "x-jap"));
        a.addListProvider(listProvider);

        const b = new Series();  
        const listProvider2 = new ListProviderLocalData("test2");
        listProvider2.id = 2;
        listProvider2.mediaType = MediaType.ANIME;
        listProvider2.addSeriesName(new Name("Test 1", "x-jap"));
        b.addListProvider(listProvider2);

        MainListManager['mainList'] = [a, b];
        const result = await seriesHelper.searchSeasonValue(a);
        console.log(result.foundType);
        strictEqual(result.season,2);
    });

    it('should get the right season value: 3', async () => {
        const a = new Series();
        const listProvider = new ListProviderLocalData("test2");
        listProvider.id = 1;
        listProvider.mediaType = MediaType.ANIME;
        listProvider.prequelIds.push(2);
        listProvider.addSeriesName(new Name("Test", "x-jap"));
        a.addListProvider(listProvider);

        const b = new Series();  
        const listProvider2 = new ListProviderLocalData("test2");
        listProvider2.id = 2;
        listProvider2.prequelIds.push(3);
        listProvider2.mediaType = MediaType.ANIME;
        listProvider2.addSeriesName(new Name("TestTwo", "x-jap"));
        b.addListProvider(listProvider2);
        
        const c = new Series();  
        const listProvider3 = new ListProviderLocalData("test2");
        listProvider3.id = 3;
        listProvider3.mediaType = MediaType.ANIME;
        listProvider3.addSeriesName(new Name("Test 1", "x-jap"));
        b.addListProvider(listProvider3);

        MainListManager['mainList'] = [a, b,c];
        const result = await seriesHelper.searchSeasonValue(a);
        console.log(result.foundType);
        strictEqual(result.season,3);
    });
});