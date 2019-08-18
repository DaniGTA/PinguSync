
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line

import * as assert from 'assert';

import Series from '../../src/backend/controller/objects/series';
import Name from '../../src/backend/controller/objects/meta/name';
import ProviderList from '../../src/backend/controller/provider-manager/provider-list';
import ListController from '../../src/backend/controller/list-controller';
import listHelper from '../../src/backend/helpFunctions/list-helper';
import { ListProviderLocalData } from '../../src/backend/controller/objects/list-provider-local-data';
import stringHelper from '../../src/backend/helpFunctions/string-helper';
import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager';
import MainListLoader from '../../src/backend/controller/main-list-manager/main-list-loader';
import { NameType } from '../../src/backend/controller/objects/meta/name-type';
import seriesHelper from '../../src/backend/helpFunctions/series-helper';
import TestProvider from './objects/testClass/testProvider';

describe('ListControllerTest | Combine', () => {
    var lc = new ListController();
    
    before(() => {
        ProviderList['loadedListProvider'] = [];
        ProviderList['loadedInfoProvider'] = [];
        MainListManager['listLoaded'] = true;
    })
    beforeEach(() => {
        MainListManager['mainList'] = [];
    })
    it('should combine same entry', async () => {


        var entry: Series[] = [];
        entry.push(getFilledAnime());
        entry.push(getFilledAnime());
        var a = await lc['addSeriesToMainList'](...entry);
        assert.equal(MainListManager['mainList'].length, 1);
    });

    it('should combine basic entrys correct', async () => {

        var entry: Series[] = [];
        entry.push(getFilledAnime("Test A"));
        entry.push(getFilledAnime("Test B"));
        for (let index = 0; index < 20; index++) {
            entry.push(getRandomeFilledAnime());
        }
        var a = await lc['addSeriesToMainList'](...entry);
        assert.equal(MainListManager['mainList'].length, 21);
    });

    it('should combine basic entrys with less data', async () => {
        var entry: Series[] = [];
        var x2 = getFilledAnime("Test A");
        x2.episodes = undefined;
        x2.releaseYear = undefined;
        entry.push(x2);
        entry.push(getFilledAnime("Test B"));
        for (let index = 0; index < 20; index++) {
            entry.push(getRandomeFilledAnime());
        }
        var a = await lc['addSeriesToMainList'](...entry);
        assert.equal(MainListManager['mainList'].length, 21);
        return;
    });

    it('should combine basic entrys with season in title (1/4)', async () => {
        var entry: Series[] = [];
        var x2 = getFilledAnime("TestA");
        x2.getListProvidersInfos()[0].targetSeason = undefined;
        x2.addSeriesName(new Name("Test III", "en"));
        entry.push(x2);
        entry.push(getFilledAnime("TestB"));
        for (let index = 0; index < 20; index++) {
            entry.push(getRandomeFilledAnime());
        }
        var a = await lc['addSeriesToMainList'](...entry);
        assert.equal(MainListManager['mainList'].length, 21);
        return;
    });
    it('should combine basic entrys with season in title (2/4)', async () => {
        var entry: Series[] = [];
        var x2 = getFilledAnime("TestA");
        x2.getListProvidersInfos()[0].targetSeason = undefined;
        x2.addSeriesName(new Name("Test 3", "en"));
        entry.push(x2);
        entry.push(getFilledAnime("TestB"));
        for (let index = 0; index < 20; index++) {
            entry.push(getRandomeFilledAnime());
        }
        var a = await lc['addSeriesToMainList'](...entry);
        assert.equal(MainListManager['mainList'].length, 21);
        return;
    });
    it('should combine basic entrys with season in title (3/4)', async () => {
        var entry: Series[] = [];
        var x2 = getFilledAnime("TestA");
        x2.addSeriesName(new Name("Test Season 3", "en"));
        x2.releaseYear = 0;
        x2.episodes = 0;
        entry.push(x2);
        entry.push(getFilledAnime("TestB"));
        for (let index = 0; index < 20; index++) {
            entry.push(getRandomeFilledAnime());
        }
        var a = await lc['addSeriesToMainList'](...entry);
        assert.equal(MainListManager['mainList'].length, 21);
        return;
    });

    it('should combine basic entrys with season in title (4/5)', async () => {
        var entry: Series[] = [];
        let x = getFilledAnime("TestA");
        x.addSeriesName(new Name("Test", "en"));
        var x2 = getFilledAnime("TestB");
        x2.addSeriesName(new Name("Test x", "en"));
        x2.releaseYear = 0;
        x2.episodes = 0;
        entry.push(x2);
        entry.push(x);
        for (let index = 0; index < 22; index++) {
            entry.push(getRandomeFilledAnime());
        }
        var a = await lc['addSeriesToMainList'](...entry);
        assert.equal(MainListManager['mainList'].length, 23);
        return;
    });

    it('should combine (4/4)', async () => {
        var entry: Series[] = [];
        let x = getFilledAnime();
        x.releaseYear = 2002;
        x.episodes = 220;
        var x2 = getFilledAnime();

        x2.releaseYear = 2002;
        x2.episodes = 220;
        entry.push(x2);
        entry.push(x);
        for (let index = 0; index < 22; index++) {
            entry.push(getRandomeFilledAnime());
        }
        var a = await lc['addSeriesToMainList'](...entry);
        assert.equal(MainListManager['mainList'].length, 23);
        return;
    });

    it('should combine 6', async () => {
        const testListProvider1 = new TestProvider('test', false);
        testListProvider1.hasUniqueIdForSeasons = true;
        const testListProvider2 = new TestProvider('test2', false);
        testListProvider1.hasUniqueIdForSeasons = false;
        ProviderList['loadedListProvider'] = [];
        ProviderList['loadedListProvider'].push(testListProvider1, testListProvider2);
        var entry: Series[] = [];
        const lplc = new ListProviderLocalData('test');
        lplc.prequelIds.push(1);
        lplc.id = 2;
        let x = new Series();
        x['cachedSeason'] = 2;
        x.releaseYear = 2017
        x.episodes = 11;
        x.addSeriesName(new Name("Test", "unkown", NameType.UNKNOWN));

        const lplcs1 = new ListProviderLocalData('test');
        lplcs1.sequelIds.push(2);
        lplcs1.id = 1;
        let xs1 =new Series();
        xs1['cachedSeason'] = 1;
        xs1.addSeriesName(new Name("Rewrite", "en", NameType.OFFICIAL));
        
        const lplc2 = new ListProviderLocalData('test2');
        lplc.targetSeason = 2;
        var x2 = new Series();
        x2.addSeriesName(new Name("Rewrite", "en", NameType.OFFICIAL));
        x2.addSeriesName(new Name("rewrite", "slug", NameType.SLUG));
        x2.addSeriesName(new Name("リライト", "ja", NameType.UNKNOWN));
    
        x2.addListProvider(lplc)

        var a = await lc['addSeriesToMainList'](x,x2,xs1);
        assert.equal(MainListManager['mainList'].length, 2);
        return;
    });


    it('should sort list', async () => {
        var entry: Series[] = [];
        var x2 = getFilledAnime();
        x2.addSeriesName(new Name("A", "en"));
        var x3 = getFilledAnime();
        x3.addSeriesName(new Name("B", "en"));
        var x4 = getFilledAnime();
        x4.addSeriesName(new Name("C", "en"));
        var x5 = getFilledAnime();
        x5.addSeriesName(new Name("D", "en"));
        var x6 = getFilledAnime();
        x6.addSeriesName(new Name("E", "en"));
        var x7 = getFilledAnime();
        x7.addSeriesName(new Name("F", "en"));

        entry.push(x7);
        entry.push(x6);
        entry.push(x5);
        entry.push(x4);
        entry.push(x3);
        entry.push(x2);
        entry = await listHelper.shuffle<Series>(entry);
        entry = await listHelper.sortList(entry);
        assert.equal(await entry[0].getAllNames(), await x2.getAllNames());
        assert.equal(await entry[1].getAllNames(), await x3.getAllNames());
        assert.equal(await entry[2].getAllNames(), await x4.getAllNames());
        return;
    });

    it('should clean doubled entrys (1/2)', async () => {
        var lpld = new ListProviderLocalData();
        lpld.id = 2;
        lpld.episodes = 12;
        lpld.targetSeason = 1;
        var x1 = getFilledAnime();
        x1.getListProvidersInfos()[0].targetSeason = 1;
        x1.addListProvider(lpld);

        var x2 = getFilledAnime();
        x2.addListProvider(lpld);
        x2.getListProvidersInfos()[0].targetSeason = 1;

        var x3 = getFilledAnime();
        x3.addListProvider(lpld);
        x3.getListProvidersInfos()[0].targetSeason = 1;

        await lc.addSeriesToMainList(x1, x2, x3);

        assert.equal(MainListManager['mainList'].length, 1);
    })
    it('should clean doubled entrys (3/3)', async () => {
        var lpld = new ListProviderLocalData();
        lpld.id = 2;
        lpld.episodes = 12;
        lpld.targetSeason = 1;
        var x1 = getFilledAnime();
        x1.getListProvidersInfos()[0].targetSeason = 1;
        x1.addListProvider(lpld);
        var x2 = getFilledAnime();
        x2.addListProvider(lpld);
        x2.getListProvidersInfos()[0].targetSeason = undefined;

        MainListManager['mainList'] = [x1, x2];

        await lc.addSeriesToMainList(x1, x2);

        assert.equal(MainListManager['mainList'].length, 1);
    })


    it('shouldnt clean doubled entrys (1/2)', async () => {
        var lpld = new ListProviderLocalData("TestA");
        lpld.id = 2;
        lpld.episodes = 12;
        var lpld2 = new ListProviderLocalData("TestB");
        lpld2.id = 3;
        lpld2.episodes = 12;

        var x1 = getFilledAnime();
        x1.getListProvidersInfos()[0].targetSeason = 1;
        x1.addListProvider(lpld);

        var x2 = getFilledAnime();
        x2.getListProvidersInfos()[0].targetSeason = 2;
        x2.addListProvider(lpld2);

        console.log(x1);
        console.log(x2);

        await lc.addSeriesToMainList(x1, x2);

        assert.equal(MainListManager['mainList'].length, 2);
    })

    it('shouldnt clean doubled entrys (2/2)', async () => {
        var lpld = new ListProviderLocalData("Test");
        lpld.id = 2;
        lpld.episodes = 12;
        var lpld2 = new ListProviderLocalData("Test");
        lpld2.id = 3;
        lpld2.episodes = 12;

        var x1 = getFilledAnime();
        x1.getListProvidersInfos()[0].targetSeason = undefined;
        x1.addListProvider(lpld);

        var x2 = getFilledAnime();
        x2.getListProvidersInfos()[0].targetSeason = undefined;
        x2.addListProvider(lpld2);

        MainListManager['mainList'] = [x1, x2];

        const x = await lc.addSeriesToMainList(x1, x2);

        assert.equal(MainListManager['mainList'].length, 2);
    })

    it('should clean doubled entrys (2/2)', async () => {
        var lpld = new ListProviderLocalData("Test");
        lpld.id = 2;
        lpld.episodes = 12;

        var x1 = getFilledAnime();
        x1.getListProvidersInfos()[0].targetSeason = undefined;
        x1.addListProvider(lpld);

        var x2 = getFilledAnime();
        x2.getListProvidersInfos()[0].targetSeason = undefined;
        x2.addListProvider(lpld);

        MainListManager['mainList'] = [x1, x2];

        await lc.addSeriesToMainList(x1, x2);

        assert.equal(MainListManager['mainList'].length, 1);
    })

    it('should clean doubled entrys (2/3)', async () => {
        var lpld = new ListProviderLocalData();
        lpld.id = 2;
        lpld.episodes = 12;

        var x1 = getFilledAnime();
        x1.getListProvidersInfos()[0].targetSeason = undefined;
        x1.addListProvider(lpld);


        var x2 = getFilledAnime();
        x2.getListProvidersInfos()[0].targetSeason = 1;
        x2.addListProvider(lpld);

        MainListManager['mainList'] = [x1, x2];

        await lc.addSeriesToMainList(x1, x2);

        assert.equal(MainListManager['mainList'].length, 1);
    })
})

function getFilledAnime(providername: string = ""): Series {
    const provider = new ListProviderLocalData(providername);
    var anime = new Series();
    anime.episodes = 10;
    anime.releaseYear = 2014;
    anime.addSeriesName(new Name("Test", "en"));
    provider.targetSeason = 3;
    anime.addListProvider(provider);
    return anime;
}

function getRandomeFilledAnime(): Series {
    const provider = new ListProviderLocalData(stringHelper.randomString());
    var anime: Series = new Series();
    anime.episodes = Math.random() * (+13 - +0) + +0;
    anime.releaseYear = Math.random() * (+2019 - +1989) + +1989;

    provider.targetSeason = Math.random() * (+3 - +0) + +0;
    anime.addSeriesName(new Name(stringHelper.randomString(), "en"));
    anime.addListProvider(provider);
    return anime;
}
