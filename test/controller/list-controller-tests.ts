import * as assert from 'assert';


import ListController from '../../src/backend/controller/list-controller';
import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager';
import Name from '../../src/backend/controller/objects/meta/name';
import { NameType } from '../../src/backend/controller/objects/meta/name-type';
import Series from '../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../src/backend/controller/provider-manager/provider-list';
import stringHelper from '../../src/backend/helpFunctions/string-helper';
import TestHelper from '../test-helper';
import TestProvider from './objects/testClass/testProvider';
// tslint:disable: no-string-literal
describe('ListController | Combine', () => {
    const lc = new ListController(true);

    beforeEach(() => {
        TestHelper.mustHaveBefore();
        ProviderList['loadedListProvider'] = [
            new TestProvider('Test'),
            new TestProvider(''),
            new TestProvider('Test A'),
            new TestProvider('Test B'),
            new TestProvider('TestA'),
            new TestProvider('TestB')];
        ProviderList['loadedInfoProvider'] = [];
        MainListManager['mainList'] = [];
    });
    test('should combine same entry', async () => {
        const entry: Series[] = [];
        entry.push(await getFilledAnime());
        entry.push(await getFilledAnime(''));
        const a = await lc['addSeriesToMainList'](...entry);
        assert.equal(MainListManager['mainList'].length, 1);
    });

    test('should combine basic entrys correct', async () => {

        const entry: Series[] = [];
        entry.push(await getFilledAnime('Test A'));
        entry.push(await getFilledAnime('Test B'));
        for (let index = 0; index < 20; index++) {
            entry.push(await getRandomeFilledAnime());
        }
        const a = await lc['addSeriesToMainList'](...entry);
        assert.equal(MainListManager['mainList'].length, 21);
    });

    test('should combine basic entrys with less data', async () => {
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

    test('should combine basic entrys with season in title (1/4)', async () => {
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
    test('should combine basic entrys with season in title (2/4)', async () => {
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
    test('should combine basic entrys with season in title (3/4)', async () => {
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

    test('should combine basic entrys with season in title (4/5)', async () => {
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

    test('should combine (4/4)', async () => {
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

    test('should combine 6', async () => {
        const testListProvider1 = new TestProvider('test', false);
        testListProvider1.hasUniqueIdForSeasons = true;

        const testListProvider2 = new TestProvider('test2', false);
        testListProvider2.hasUniqueIdForSeasons = false;

        ProviderList['loadedListProvider'] = [];
        ProviderList['loadedListProvider'].push(testListProvider1, testListProvider2);

        const lplc = new ListProviderLocalData(2, 'test');
        lplc.prequelIds.push(1);
        const x = new Series();
        x['cachedSeason'] = 2;
        lplc.releaseYear = 2017;
        x.lastInfoUpdate = Date.now();
        lplc.episodes = 11;
        lplc.addSeriesName(new Name('Test', 'unkown', NameType.UNKNOWN));
        await x.addListProvider(lplc);

        const lplcs1 = new ListProviderLocalData(1, 'test');
        lplcs1.sequelIds.push(2);
        const xs1 = new Series();
        xs1['cachedSeason'] = 1;
        xs1.lastInfoUpdate = Date.now();
        lplcs1.addSeriesName(new Name('Rewrite', 'en', NameType.OFFICIAL));
        await xs1.addListProvider(lplcs1);

        const lplc2 = new ListProviderLocalData(1, 'test2');
        lplc2.targetSeason = 2;
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

    test('should clean doubled entrys (1/2)', async () => {
        const lpld = new ListProviderLocalData(2);
        lpld.episodes = 12;
        lpld.targetSeason = 1;
        const x1 = await getFilledAnime(undefined, undefined, 1);
        await x1.addListProvider(lpld);

        const x2 = await getFilledAnime(undefined, undefined, 1);
        await x2.addListProvider(lpld);

        const x3 = await getFilledAnime(undefined, undefined, 1);
        lpld.targetSeason = 1;
        await x3.addListProvider(lpld);

        await lc.addSeriesToMainList(x1, x2, x3);

        assert.equal(MainListManager['mainList'].length, 1);
    });

    test('should get series list', async () => {
        const lpld = new ListProviderLocalData(2);
        lpld.episodes = 12;
        lpld.targetSeason = 1;
        const x1 = await getFilledAnime(undefined, undefined, 1);
        await x1.addListProvider(lpld);

        await lc.addSeriesToMainList(x1);

        assert.equal(MainListManager['mainList'].length, 1);
        if (ListController.instance) {
            assert.equal((await ListController.instance.getMainList()).length, 1);
        } else {
            fail();
        }
    });

    test('should clean doubled entrys (3/3)', async () => {
        const lpld = new ListProviderLocalData(2);
        lpld.episodes = 12;
        lpld.targetSeason = 1;
        const x1 = await getFilledAnime('', 1, 1);
        x1['infoProviderInfos'] = [];
        x1['listProviderInfos'] = [];
        await x1.addListProvider(lpld);
        const x2 = await getFilledAnime('', 1);
        x2['infoProviderInfos'] = [];
        x2['listProviderInfos'] = [];
        const lpld2 = new ListProviderLocalData(2);
        lpld2.episodes = 12;
        lpld2.targetSeason = undefined;
        await x2.addListProvider(lpld2);

        MainListManager['mainList'] = [x1, x2];

        await lc.addSeriesToMainList(x1, x2);

        assert.equal(MainListManager['mainList'].length, 1);
    });


    test('shouldnt clean doubled entrys (1/2)', async () => {
        const testListProvider1 = new TestProvider('TestA', false, true);
        const testListProvider2 = new TestProvider('TestB', false, true);
        ProviderList['loadedListProvider'] = [];
        ProviderList['loadedListProvider'].push(testListProvider1, testListProvider2);
        const lpld = new ListProviderLocalData(2, 'TestA');
        lpld.episodes = 12;
        lpld.targetSeason = 1;
        const lpld2 = new ListProviderLocalData(3, 'TestB');
        lpld2.episodes = 12;
        lpld2.targetSeason = 2;
        const x1 = await getFilledAnime();
        x1['infoProviderInfos'] = [];
        x1['listProviderInfos'] = [];
        await x1.addListProvider(lpld);

        const x2 = await getFilledAnime();
        x2['infoProviderInfos'] = [];
        x2['listProviderInfos'] = [];
        await x2.addListProvider(lpld2);

        await lc.addSeriesToMainList(x1, x2);

        assert.equal(MainListManager['mainList'].length, 2);
    });

    test('shouldnt clean doubled entrys (2/2)', async () => {
        const lpld = new ListProviderLocalData(2, 'Test');
        lpld.episodes = 12;
        lpld.targetSeason = undefined;
        const lpld2 = new ListProviderLocalData(3, 'Test');
        lpld2.episodes = 12;
        lpld2.targetSeason = undefined;

        const x1 = await getFilledAnime();
        x1['listProviderInfos'] = [];
        await x1.addListProvider(lpld);

        const x2 = await getFilledAnime();
        x2['listProviderInfos'] = [];
        await x2.addListProvider(lpld2);

        MainListManager['mainList'] = [x1, x2];

        const x = await lc.addSeriesToMainList(x1, x2);

        assert.equal(MainListManager['mainList'].length, 2);
    });

    test('should clean doubled entrys (2/2)', async () => {
        const lpld = new ListProviderLocalData(2, 'Test');
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

    test('should clean doubled entrys with different season', async () => {
        const lpld = new ListProviderLocalData(2);
        lpld.episodes = 10;
        lpld.targetSeason = undefined;
        const x1 = await getFilledAnime('Test', 1, null);
        await x1.addListProvider(lpld);

        const lpld2 = new ListProviderLocalData(2);
        lpld2.episodes = 10;
        lpld2.targetSeason = 1;

        const x2 = await getFilledAnime('Test', 1);
        await x2.addListProvider(lpld2);

        MainListManager['mainList'] = [x1, x2];

        await lc.addSeriesToMainList(x1, x2);

        assert.equal(MainListManager['mainList'].length, 1);
    });

    test('should contain last update date', async () => {
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

async function getFilledAnime(providername: string = 'Test', providerId: number = -1, targetSeason: number | null | undefined = 3): Promise<Series> {
    if (targetSeason === null) {
        targetSeason = undefined;
    }

    let id = Math.random() * (+0 - +10000) + +10000;
    if (providerId !== -1) {
        id = providerId;
    } else {
        id = Math.random() * (+0 - +10000) + +10000;
    }
    const provider = new ListProviderLocalData(id, providername);

    const anime = new Series();
    provider.episodes = 10;
    provider.releaseYear = 2014;
    provider.addSeriesName(new Name('FilledTest', 'en'));
    provider.targetSeason = targetSeason;
    await anime.addListProvider(provider);
    return anime;
}

async function getRandomeFilledAnime(): Promise<Series> {
    if (!ProviderList['loadedListProvider']) {
        fail();
    }
    const id = Math.random() * (+0 - +10000) + +10000;
    const providerName = stringHelper.randomString();
    const provider = new ListProviderLocalData(id, providerName);
    ProviderList['loadedListProvider'].push(new TestProvider(providerName));
    const anime: Series = new Series();
    provider.episodes = Math.random() * (+13 - +0) + +0;
    provider.releaseYear = Math.random() * (+2019 - +1989) + +1989;
    provider.targetSeason = Math.random() * (+3 - +0) + +0;

    provider.addSeriesName(new Name(stringHelper.randomString(), 'en'));
    await anime.addListProvider(provider);
    return anime;
}
