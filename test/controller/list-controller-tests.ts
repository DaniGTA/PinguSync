import * as assert from 'assert';
import ListController from '../../src/backend/controller/list-controller';
import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager';
import Name from '../../src/backend/controller/objects/meta/name';
import Season from '../../src/backend/controller/objects/meta/season';
import Series from '../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../src/backend/controller/provider-controller/provider-manager/provider-list';
import ProviderDataWithSeasonInfo from '../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import stringHelper from '../../src/backend/helpFunctions/string-helper';
import TestProvider from './objects/testClass/testProvider';
// tslint:disable: no-string-literal
describe('ListController | Combine', () => {
    const lc = new ListController(true);

    beforeEach(() => {
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
    async function getRandomeFilledAnime(): Promise<Series> {
        const id = Math.random() * (+0 - +10000) + +10000;
        const providerName = stringHelper.randomString();
        const provider = new ListProviderLocalData(id, providerName);
        ProviderList['loadedListProvider']?.push(new TestProvider(providerName));
        const anime: Series = new Series();
        provider.episodes = Math.random() * (+13 - +0) + +0;
        provider.releaseYear = Math.random() * (+2019 - +1989) + +1989;
        const season = Math.random() * (+3 - +0) + +0;

        provider.addSeriesName(new Name(stringHelper.randomString(), 'en'));
        await anime.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(provider, new Season([season])));
        return anime;
    }

    async function getFilledAnime(providername = 'Test', providerId = -1, targetSeason: number | null | undefined = 3): Promise<Series> {
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
        await anime.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(provider, new Season(targetSeason)));
        return anime;
    }

    test('should combine same entry', async () => {
        const entry: Series[] = [];
        entry.push(await getFilledAnime());
        entry.push(await getFilledAnime(''));
        const a = await lc['addSeriesToMainList'](...entry);
        expect(MainListManager['mainList'].length).toEqual(1);
    });

    test('should combine basic entrys correct', async () => {

        const entry: Series[] = [];
        entry.push(await getFilledAnime('Test A'));
        entry.push(await getFilledAnime('Test B'));
        for (let index = 0; index < 10; index++) {
            entry.push(await getRandomeFilledAnime());
        }
        const a = await lc['addSeriesToMainList'](...entry);
        assert.equal(MainListManager['mainList'].length, 11);
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
        x2.getAllProviderBindings()[0].targetSeason = undefined;
        x2.getListProvidersInfos()[0].addSeriesName(new Name('Test III', 'en'));
        entry.push(x2);
        entry.push(await getFilledAnime('TestB'));
        for (let index = 0; index < 10; index++) {
            entry.push(await getRandomeFilledAnime());
        }
        const a = await lc['addSeriesToMainList'](...entry);
        assert.equal(MainListManager['mainList'].length, 11);
        return;
    });
    test('should combine basic entrys with season in title (2/4)', async () => {
        const entry: Series[] = [];
        const x2 = await getFilledAnime('TestA');
        x2.getAllProviderBindings()[0].targetSeason = undefined;
        x2.getListProvidersInfos()[0].addSeriesName(new Name('Test 3', 'en'));
        entry.push(x2);
        entry.push(await getFilledAnime('TestB'));
        for (let index = 0; index < 10; index++) {
            entry.push(await getRandomeFilledAnime());
        }
        const a = await lc['addSeriesToMainList'](...entry);
        expect(MainListManager['mainList'].length).toEqual(11);
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
        for (let index = 0; index < 10; index++) {
            entry.push(await getRandomeFilledAnime());
        }
        const a = await lc['addSeriesToMainList'](...entry);
        expect(MainListManager['mainList'].length).toEqual(11);
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
        for (let index = 0; index < 12; index++) {
            entry.push(await getRandomeFilledAnime());
        }
        const a = await lc['addSeriesToMainList'](...entry);
        expect(MainListManager['mainList'].length).toEqual(13);
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
        for (let index = 0; index < 12; index++) {
            entry.push(await getRandomeFilledAnime());
        }
        const a = await lc['addSeriesToMainList'](...entry);
        expect(MainListManager['mainList'].length).toEqual(13);
        return;
    });

    test('should clean doubled entrys (1/2)', async () => {
        const lpld = new ListProviderLocalData(2);
        lpld.episodes = 12;
        const x1 = await getFilledAnime(undefined, undefined, 1);
        await x1.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld, new Season([1])));

        const x2 = await getFilledAnime(undefined, undefined, 1);
        await x2.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld, new Season([1])));

        const x3 = await getFilledAnime(undefined, undefined, 1);
        await x3.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld, new Season([1])));

        await lc.addSeriesToMainList(x1, x2, x3);

        expect(MainListManager['mainList'].length).toEqual(1);
    });

    test('should get series list', async () => {
        const lpld = new ListProviderLocalData(2);
        lpld.episodes = 12;
        const x1 = await getFilledAnime(undefined, undefined, 1);
        await x1.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld, new Season([1])));

        await lc.addSeriesToMainList(x1);

        assert.equal(MainListManager['mainList'].length, 1);
        expect((ListController?.instance?.getMainList())?.length).toEqual(1);

    });

    test('should clean doubled entrys (3/3)', async () => {
        const lpld = new ListProviderLocalData(2);
        lpld.episodes = 12;
        const x1 = await getFilledAnime('', 1, 1);
        x1['infoProviderInfos'] = [];
        x1['listProviderInfos'] = [];
        await x1.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld, new Season([1])));
        const x2 = await getFilledAnime('', 1);
        x2['infoProviderInfos'] = [];
        x2['listProviderInfos'] = [];
        const lpld2 = new ListProviderLocalData(2);
        lpld2.episodes = 12;
        await x2.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld2));

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
        const lpld2 = new ListProviderLocalData(3, 'TestB');
        lpld2.episodes = 12;
        const x1 = await getFilledAnime();
        x1['infoProviderInfos'] = [];
        x1['listProviderInfos'] = [];
        await x1.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld, new Season([1])));

        const x2 = await getFilledAnime();
        x2['infoProviderInfos'] = [];
        x2['listProviderInfos'] = [];
        await x2.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld2, new Season([2])));

        await lc.addSeriesToMainList(x1, x2);

        assert.equal(MainListManager['mainList'].length, 2);
    });

    test('shouldnt clean doubled entrys (2/2)', async () => {
        const lpld = new ListProviderLocalData(2, 'Test');
        lpld.episodes = 12;
        const lpld2 = new ListProviderLocalData(3, 'Test');
        lpld2.episodes = 12;

        const x1 = await getFilledAnime();
        x1['listProviderInfos'] = [];
        await x1.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld));

        const x2 = await getFilledAnime();
        x2['listProviderInfos'] = [];
        await x2.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld2));

        MainListManager['mainList'] = [x1, x2];

        const x = await lc.addSeriesToMainList(x1, x2);

        assert.equal(MainListManager['mainList'].length, 2);
    });

    test('should clean doubled entrys (2/2)', async () => {
        const lpld = new ListProviderLocalData(2, 'Test');
        lpld.episodes = 12;

        const x1 = await getFilledAnime();
        x1['listProviderInfos'] = [];
        await x1.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld));


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
        const x1 = await getFilledAnime('Test', 1, null);
        await x1.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld));

        const lpld2 = new ListProviderLocalData(2);
        lpld2.episodes = 10;

        const x2 = await getFilledAnime('Test', 1, 1);
        await x2.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld2, new Season([1])));

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
