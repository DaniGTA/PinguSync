
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line

import * as assert from 'assert';

import ListController from '../../src/backend/controller/list-controller';
import MainListLoader from '../../src/backend/controller/main-list-manager/main-list-loader';
import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager';
import { ListProviderLocalData } from '../../src/backend/controller/objects/list-provider-local-data';
import Name from '../../src/backend/controller/objects/meta/name';
import { NameType } from '../../src/backend/controller/objects/meta/name-type';
import Series from '../../src/backend/controller/objects/series';
import ProviderList from '../../src/backend/controller/provider-manager/provider-list';
import listHelper from '../../src/backend/helpFunctions/list-helper';
import stringHelper from '../../src/backend/helpFunctions/string-helper';
import TestProvider from './objects/testClass/testProvider';

describe('ListController | Combine', () => {
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
        ProviderList['loadedListProvider'] = [new TestProvider('Test'), new TestProvider('')];
        ProviderList['loadedInfoProvider'] = [];
        MainListManager['mainList'] = [];
    });
    it('should combine same entry', async () => {
        const entry: Series[] = [];
        entry.push(await getFilledAnime());
        entry.push(await getFilledAnime(''));
        const a = await lc['addSeriesToMainList'](...entry);
        assert.equal(MainListManager['mainList'].length, 1);
    });

    it('should combine basic entrys correct', async () => {

        const entry: Series[] = [];
        entry.push(await getFilledAnime('Test A'));
        entry.push(await getFilledAnime('Test B'));
        for (let index = 0; index < 20; index++) {
            entry.push(await getRandomeFilledAnime());
        }
        const a = await lc['addSeriesToMainList'](...entry);
        assert.equal(MainListManager['mainList'].length, 21);
    });

    it('should combine basic entrys with less data', async () => {
        const entry: Series[] = [];
        const x2 = await getFilledAnime('Test A');
        x2.getListProvidersInfos()[0]['episodes'] = undefined;
        x2.getListProvidersInfos()[0]['releaseYear'] = undefined;
        entry.push(x2);
        entry.push(await getFilledAnime('Test B'));
        for (let index = 0; index < 20; index++) {
            entry.push(await getRandomeFilledAnime());
        }
        const a = await lc['addSeriesToMainList'](...entry);
        assert.equal(MainListManager['mainList'].length, 21);
        return;
    });

    it('should combine basic entrys with season in title (1/4)', async () => {
        const entry: Series[] = [];
        const x2 = await getFilledAnime('TestA');
        x2.getListProvidersInfos()[0].targetSeason = undefined;
        x2.getListProvidersInfos()[0].addSeriesName(new Name('Test III', 'en'));
        entry.push(x2);
        entry.push(await getFilledAnime('TestB'));
        for (let index = 0; index < 20; index++) {
            entry.push(await getRandomeFilledAnime());
        }
        const a = await lc['addSeriesToMainList'](...entry);
        assert.equal(MainListManager['mainList'].length, 21);
        return;
    });
    it('should combine basic entrys with season in title (2/4)', async () => {
        const entry: Series[] = [];
        const x2 = await getFilledAnime('TestA');
        x2.getListProvidersInfos()[0].targetSeason = undefined;
        x2.getListProvidersInfos()[0].addSeriesName(new Name('Test 3', 'en'));
        entry.push(x2);
        entry.push(await getFilledAnime('TestB'));
        for (let index = 0; index < 20; index++) {
            entry.push(await getRandomeFilledAnime());
        }
        const a = await lc['addSeriesToMainList'](...entry);
        assert.equal(MainListManager['mainList'].length, 21);
        return;
    });
    it('should combine basic entrys with season in title (3/4)', async () => {
        const entry: Series[] = [];
        const x2 = await getFilledAnime('TestA');
        x2.getListProvidersInfos()[0].addSeriesName(new Name('Test Season 3', 'en'));
        x2.getListProvidersInfos()[0]['episodes'] = 0;
        x2.getListProvidersInfos()[0]['releaseYear'] = 0;
        entry.push(x2);
        entry.push(await getFilledAnime('TestB'));
        for (let index = 0; index < 20; index++) {
            entry.push(await getRandomeFilledAnime());
        }
        const a = await lc['addSeriesToMainList'](...entry);
        assert.equal(MainListManager['mainList'].length, 21);
        return;
    });

    it('should combine basic entrys with season in title (4/5)', async () => {
        const entry: Series[] = [];
        const x = await getFilledAnime('TestA');
        x.getListProvidersInfos()[0].addSeriesName(new Name('Test', 'en'));
        const x2 = await getFilledAnime('TestB');
        x2.getListProvidersInfos()[0].addSeriesName(new Name('Test x', 'en'));
        x2.getListProvidersInfos()[0]['episodes'] = 0;
        x2.getListProvidersInfos()[0]['releaseYear'] = 0;

        entry.push(x2);
        entry.push(x);
        for (let index = 0; index < 22; index++) {
            entry.push(await getRandomeFilledAnime());
        }
        const a = await lc['addSeriesToMainList'](...entry);
        assert.equal(MainListManager['mainList'].length, 23);
        return;
    });

    it('should combine (4/4)', async () => {
        const entry: Series[] = [];
        const x = await getFilledAnime();

        x.getListProvidersInfos()[0]['episodes'] = 220;
        x.getListProvidersInfos()[0]['releaseYear'] = 2002;
        const x2 = await getFilledAnime('');

        x2.getListProvidersInfos()[0]['episodes'] = 220;
        x2.getListProvidersInfos()[0]['releaseYear'] = 2002;
        entry.push(x2);
        entry.push(x);
        for (let index = 0; index < 22; index++) {
            entry.push(await getRandomeFilledAnime());
        }
        const a = await lc['addSeriesToMainList'](...entry);
        assert.equal(MainListManager['mainList'].length, 23);
        return;
    });

    it('should combine 6', async () => {
        const testListProvider1 = new TestProvider('test', false);
        testListProvider1.hasUniqueIdForSeasons = true;

        const testListProvider2 = new TestProvider('test2', false);
        testListProvider2.hasUniqueIdForSeasons = false;

        ProviderList['loadedListProvider'] = [];
        ProviderList['loadedListProvider'].push(testListProvider1, testListProvider2);

        const lplc = new ListProviderLocalData('test');
        lplc.prequelIds.push(1);
        lplc.id = 2;
        const x = new Series();
        x['cachedSeason'] = 2;
        lplc.releaseYear = 2017;
        x.lastInfoUpdate = Date.now();
        lplc.episodes = 11;
        lplc.addSeriesName(new Name('Test', 'unkown', NameType.UNKNOWN));
        await x.addListProvider(lplc);

        const lplcs1 = new ListProviderLocalData('test');
        lplcs1.sequelIds.push(2);
        lplcs1.id = 1;
        const xs1 = new Series();
        xs1['cachedSeason'] = 1;
        xs1.lastInfoUpdate = Date.now();
        lplcs1.addSeriesName(new Name('Rewrite', 'en', NameType.OFFICIAL));
        await xs1.addListProvider(lplcs1);

        const lplc2 = new ListProviderLocalData('test2');
        lplc2.targetSeason = 2;
        lplc2.id = 1;
        const x2 = new Series();
        x2.lastInfoUpdate = Date.now();
        lplc2.addSeriesName(new Name('Rewrite', 'en', NameType.OFFICIAL));
        lplc2.addSeriesName(new Name('rewrite', 'slug', NameType.SLUG));
        lplc2.addSeriesName(new Name('リライト', 'ja', NameType.UNKNOWN));

        await x2.addListProvider(lplc2);

        const a = await lc['addSeriesToMainList'](x, xs1, x2);
        assert.equal(MainListManager['mainList'].length, 2, MainListManager['mainList'].toString());
        return;
    });


    it('should sort list', async () => {
        let entry: Series[] = [];
        const x2 = await getFilledAnime();
        x2.getListProvidersInfos()[0].addSeriesName(new Name('A', 'en'));
        const x3 = await getFilledAnime();
        x3.getListProvidersInfos()[0].addSeriesName(new Name('B', 'en'));
        const x4 = await getFilledAnime();
        x4.getListProvidersInfos()[0].addSeriesName(new Name('C', 'en'));
        const x5 = await getFilledAnime();
        x5.getListProvidersInfos()[0].addSeriesName(new Name('D', 'en'));
        const x6 = await getFilledAnime();
        x6.getListProvidersInfos()[0].addSeriesName(new Name('E', 'en'));
        const x7 = await getFilledAnime();
        x7.getListProvidersInfos()[0].addSeriesName(new Name('F', 'en'));

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
        const lpld = new ListProviderLocalData();
        lpld.id = 2;
        lpld.episodes = 12;
        lpld.targetSeason = 1;
        const x1 = await getFilledAnime();
        x1.getListProvidersInfos()[0].targetSeason = 1;
        await x1.addListProvider(lpld);

        const x2 = await getFilledAnime();
        await x2.addListProvider(lpld);
        x2.getListProvidersInfos()[0].targetSeason = 1;

        const x3 = await getFilledAnime();
        await x3.addListProvider(lpld);
        x3.getListProvidersInfos()[0].targetSeason = 1;

        await lc.addSeriesToMainList(x1, x2, x3);

        assert.equal(MainListManager['mainList'].length, 1);
    });
    it('should clean doubled entrys (3/3)', async () => {
        const lpld = new ListProviderLocalData();
        lpld.id = 2;
        lpld.episodes = 12;
        lpld.targetSeason = 1;
        const x1 = await getFilledAnime('', 1);
        x1.getListProvidersInfos()[0].targetSeason = 1;
        await x1.addListProvider(lpld);
        const x2 = await getFilledAnime('', 1);
        await x2.addListProvider(lpld);
        x2.getListProvidersInfos()[0].targetSeason = undefined;

        MainListManager['mainList'] = [x1, x2];

        await lc.addSeriesToMainList(x1, x2);

        assert.equal(MainListManager['mainList'].length, 2);
    });


    it('shouldnt clean doubled entrys (1/2)', async () => {
        const testListProvider1 = new TestProvider('TestA', false, true);
        const testListProvider2 = new TestProvider('TestB', false, true);
        ProviderList['loadedListProvider'] = [];
        ProviderList['loadedListProvider'].push(testListProvider1, testListProvider2);
        const lpld = new ListProviderLocalData('TestA');
        lpld.id = 2;
        lpld.episodes = 12;
        const lpld2 = new ListProviderLocalData('TestB');
        lpld2.id = 3;
        lpld2.episodes = 12;

        const x1 = await getFilledAnime();
        await x1.addListProvider(lpld);
        x1.getListProvidersInfos()[0].targetSeason = 1;

        const x2 = await getFilledAnime();
        await x2.addListProvider(lpld2);
        x2.getListProvidersInfos()[0].targetSeason = 2;

        await lc.addSeriesToMainList(x1, x2);

        assert.equal(MainListManager['mainList'].length, 2);
    });

    it('shouldnt clean doubled entrys (2/2)', async () => {
        const lpld = new ListProviderLocalData('Test');
        lpld.id = 2;
        lpld.episodes = 12;
        const lpld2 = new ListProviderLocalData('Test');
        lpld2.id = 3;
        lpld2.episodes = 12;

        const x1 = await getFilledAnime();
        x1['listProviderInfos'] = [];
        await x1.addListProvider(lpld);
        x1.getListProvidersInfos()[0].targetSeason = undefined;

        const x2 = await getFilledAnime();
        x2['listProviderInfos'] = [];
        await x2.addListProvider(lpld2);
        x2.getListProvidersInfos()[0].targetSeason = undefined;

        MainListManager['mainList'] = [x1, x2];

        const x = await lc.addSeriesToMainList(x1, x2);

        assert.equal(MainListManager['mainList'].length, 2);
    });

    it('should clean doubled entrys (2/2)', async () => {
        const lpld = new ListProviderLocalData('Test');
        lpld.id = 2;
        lpld.episodes = 12;
        lpld.targetSeason = undefined;

        const x1 = await getFilledAnime();
        x1['listProviderInfos'] = [];
        await x1.addListProvider(lpld);


        const x2 = await getFilledAnime();
        x2['listProviderInfos'] = [];
        await x2.addListProvider(lpld);
        MainListManager['mainList'] = [x1, x2];

        await lc.addSeriesToMainList(x1, x2);

        assert.equal(MainListManager['mainList'].length, 1);
    });

    it('should clean doubled entrys (2/3)', async () => {
        const lpld = new ListProviderLocalData();
        lpld.id = 2;
        lpld.episodes = 10;

        const x1 = await getFilledAnime('Test', 1);
        x1.getListProvidersInfos()[0].targetSeason = undefined;
        await x1.addListProvider(lpld);


        const x2 = await getFilledAnime('Test', 1);
        x2.getListProvidersInfos()[0].targetSeason = 1;
        await x2.addListProvider(lpld);

        MainListManager['mainList'] = [x1, x2];

        await lc.addSeriesToMainList(x1, x2);

        assert.equal(MainListManager['mainList'].length, 2);
    });

    it('should contain last update date', async () => {
        const x1 = await getFilledAnime('Test', 1);
        x1.lastInfoUpdate = 10;
        x1.lastUpdate = 10;
        const x2 = await getFilledAnime('Test', 1);
        x2.lastInfoUpdate = 0;
        x2.lastUpdate = 0;

        await lc.addSeriesToMainList(x1);
        await lc.addSeriesToMainList(x2);

        assert.notEqual(MainListManager['mainList'][0].lastInfoUpdate, 0);
        assert.notEqual(MainListManager['mainList'][0].lastUpdate, 0);
    });
});

async function getFilledAnime(providername: string = 'Test', providerId: number = -1): Promise<Series> {
    const provider = new ListProviderLocalData(providername);
    if (providerId != -1) {
        provider.id = providerId;
    } else {
        provider.id = Math.random() * (+0 - +10000) + +10000;
    }
    const anime = new Series();
    provider.episodes = 10;
    provider.releaseYear = 2014;
    provider.addSeriesName(new Name('FilledTest', 'en'));
    provider.targetSeason = 3;
    await anime.addListProvider(provider);
    return anime;
}

async function getRandomeFilledAnime(): Promise<Series> {
    const provider = new ListProviderLocalData(stringHelper.randomString());
    const anime: Series = new Series();
    provider.episodes = Math.random() * (+13 - +0) + +0;
    provider.releaseYear = Math.random() * (+2019 - +1989) + +1989;
    provider.targetSeason = Math.random() * (+3 - +0) + +0;
    provider.id = Math.random() * (+0 - +10000) + +10000;
    provider.addSeriesName(new Name(stringHelper.randomString(), 'en'));
    await anime.addListProvider(provider);
    return anime;
}
