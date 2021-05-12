import ListProvider from '../../src/backend/api/provider/list-provider';
import ListController from '../../src/backend/controller/list-controller';
import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager';
import Name from '../../src/backend/controller/objects/meta/name';
import Season from '../../src/backend/controller/objects/meta/season';
import Series from '../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../src/backend/controller/provider-controller/provider-manager/provider-list';
import ProviderDataWithSeasonInfo from '../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import stringHelper from '../../src/backend/helpFunctions/string-helper';
import TestListProvider from './objects/testClass/testListProvider';
import TestListProvider2 from './objects/testClass/testListProvider2';
import TestListProvider3 from './objects/testClass/testListProvider3';
// tslint:disable: no-string-literal
describe('ListController | Combine', () => {
    const lc = new ListController(true);

    beforeEach(() => {
        ProviderList['loadedListProvider'] = [
            new TestListProvider(),
            new TestListProvider2(),];
        ProviderList['loadedInfoProvider'] = [];
        MainListManager['mainList'] = [];
    });
    function getRandomeFilledAnime(provider: (new () => ListProvider)): Series {
        const id = Math.random() * (+0 - +10000) + +10000;
        const providerLocalData = new ListProviderLocalData(id, provider);
        ProviderList['loadedListProvider']?.push(new provider());
        const anime: Series = new Series();
        providerLocalData.episodes = Math.random() * (+13 - +0) + +0;
        providerLocalData.releaseYear = Math.random() * (+2019 - +1989) + +1989;
        const season = Math.random() * (+3 - +0) + +0;

        providerLocalData.addSeriesName(new Name(stringHelper.randomString(), 'en'));
        anime.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(providerLocalData, new Season([season])));
        return anime;
    }

    function getFilledAnime(provider: (new () => ListProvider) = TestListProvider, providerId = -1, targetSeason: number | null | undefined = 3): Series {
        if (targetSeason === null) {
            targetSeason = undefined;
        }

        let id;
        if (providerId !== -1) {
            id = providerId;
        } else {
            id = Math.random() * (+0 - +10000) + +10000;
        }
        const providerLocalData = new ListProviderLocalData(id, provider);

        const anime = new Series();
        providerLocalData.episodes = 10;
        providerLocalData.releaseYear = 2014;
        providerLocalData.addSeriesName(new Name('FilledTest', 'en'));
        anime.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(providerLocalData, new Season(targetSeason)));
        return anime;
    }

    test('should combine same entry', async () => {
        const entry: Series[] = [];
        entry.push(getFilledAnime());
        entry.push(getFilledAnime(TestListProvider2));
        await lc['addSeriesToMainList'](...entry);
        expect(MainListManager['mainList'].length).toEqual(1);
    });

    test('should combine basic entrys correct', async () => {

        const entry: Series[] = [];
        entry.push(getFilledAnime());
        entry.push(getFilledAnime(TestListProvider2));
        for (let index = 0; index < 10; index++) {
            entry.push(getRandomeFilledAnime(TestListProvider3));
        }
        await lc['addSeriesToMainList'](...entry);
        expect(MainListManager['mainList'].length).toBe(11);
    });

    test('should combine basic entrys with less data', async () => {
        const entry: Series[] = [];
        const x2 = getFilledAnime();
        x2.getListProvidersInfos()[0]['episodes'] = undefined;
        x2.getListProvidersInfos()[0]['releaseYear'] = undefined;
        entry.push(x2);
        entry.push(getFilledAnime(TestListProvider2));
        for (let index = 0; index < 20; index++) {
            entry.push(getRandomeFilledAnime(TestListProvider3));
        }
        await lc['addSeriesToMainList'](...entry);
        expect(MainListManager['mainList'].length).toBe(21);
        return;
    });

    test('should combine basic entrys with season in title (1/4)', async () => {
        const entry: Series[] = [];
        const x2 = getFilledAnime();
        x2.getAllProviderBindings()[0].targetSeason = undefined;
        x2.getListProvidersInfos()[0].addSeriesName(new Name('Test III', 'en'));
        entry.push(x2);
        entry.push(getFilledAnime(TestListProvider2));
        for (let index = 0; index < 10; index++) {
            entry.push(getRandomeFilledAnime(TestListProvider3));
        }
        await lc['addSeriesToMainList'](...entry);
        expect(MainListManager['mainList'].length).toBe(11);
        return;
    });
    test('should combine basic entrys with season in title (2/4)', async () => {
        const entry: Series[] = [];
        const x2 = getFilledAnime();
        x2.getAllProviderBindings()[0].targetSeason = undefined;
        x2.getListProvidersInfos()[0].addSeriesName(new Name('Test 3', 'en'));
        entry.push(x2);
        entry.push(getFilledAnime(TestListProvider2));
        for (let index = 0; index < 10; index++) {
            entry.push(getRandomeFilledAnime(TestListProvider3));
        }
        await lc['addSeriesToMainList'](...entry);
        expect(MainListManager['mainList'].length).toEqual(11);
        return;
    });
    test('should combine basic entrys with season in title (3/4)', async () => {
        const entry: Series[] = [];
        const x2 = getFilledAnime();
        x2.getListProvidersInfos()[0].addSeriesName(new Name('Test Season 3', 'en'));
        x2.getListProvidersInfos()[0]['episodes'] = 0;
        x2.getListProvidersInfos()[0]['releaseYear'] = 0;
        entry.push(x2);
        entry.push(getFilledAnime(TestListProvider2));
        for (let index = 0; index < 10; index++) {
            entry.push(getRandomeFilledAnime(TestListProvider3));
        }
        await lc['addSeriesToMainList'](...entry);
        expect(MainListManager['mainList'].length).toEqual(11);
        return;
    });

    test('should combine basic entrys with season in title (4/5)', async () => {
        const entry: Series[] = [];
        const x = getFilledAnime();
        x.getListProvidersInfos()[0].addSeriesName(new Name('Test', 'en'));
        const x2 = getFilledAnime(TestListProvider2);
        x2.getListProvidersInfos()[0].addSeriesName(new Name('Test x', 'en'));
        x2.getListProvidersInfos()[0]['episodes'] = 0;
        x2.getListProvidersInfos()[0]['releaseYear'] = 0;

        entry.push(x2);
        entry.push(x);
        for (let index = 0; index < 12; index++) {
            entry.push(getRandomeFilledAnime(TestListProvider3));
        }
        await lc['addSeriesToMainList'](...entry);
        expect(MainListManager['mainList'].length).toEqual(13);
        return;
    });

    test('should combine (4/4)', async () => {
        const entry: Series[] = [];
        const x = getFilledAnime();

        x.getListProvidersInfos()[0]['episodes'] = 220;
        x.getListProvidersInfos()[0]['releaseYear'] = 2002;
        const x2 = getFilledAnime(TestListProvider2);

        x2.getListProvidersInfos()[0]['episodes'] = 220;
        x2.getListProvidersInfos()[0]['releaseYear'] = 2002;
        entry.push(x2);
        entry.push(x);
        for (let index = 0; index < 12; index++) {
            entry.push(getRandomeFilledAnime(TestListProvider3));
        }
        await lc['addSeriesToMainList'](...entry);
        expect(MainListManager['mainList'].length).toEqual(13);
        return;
    });

    test('should clean doubled entrys (1/2)', async () => {
        const lpld = new ListProviderLocalData(2);
        lpld.episodes = 12;
        const x1 = getFilledAnime(undefined, undefined, 1);
        x1['listProviderInfos'].length = 0;
        x1.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld, new Season([1])));

        const x2 = getFilledAnime(undefined, undefined, 1);
        x2['listProviderInfos'].length = 0;
        x2.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld, new Season([1])));

        const x3 = getFilledAnime(undefined, undefined, 1);
        x3['listProviderInfos'].length = 0;
        x3.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld, new Season([1])));

        await lc.addSeriesToMainList(x1, x2, x3);
        expect(MainListManager['mainList'].length).toEqual(1);
    });

    test('should get series list', async () => {
        const lpld = new ListProviderLocalData(2);
        lpld.episodes = 12;
        const x1 = getFilledAnime(undefined, undefined, 1);
        x1.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld, new Season([1])));

        await lc.addSeriesToMainList(x1);

        expect(MainListManager['mainList'].length).toBe(1);
        expect((ListController?.instance?.getMainList())?.length).toEqual(1);

    });

    test('should clean doubled entrys (3/3)', async () => {
        const lpld = new ListProviderLocalData(2);
        lpld.episodes = 12;
        const x1 = getFilledAnime(TestListProvider2, 1, 1);
        x1['infoProviderInfos'] = [];
        x1['listProviderInfos'] = [];
        x1.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld, new Season([1])));
        const x2 = getFilledAnime(TestListProvider2, 1);
        x2['infoProviderInfos'] = [];
        x2['listProviderInfos'] = [];
        const lpld2 = new ListProviderLocalData(2);
        lpld2.episodes = 12;
        x2.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld2));

        MainListManager['mainList'] = [x1, x2];

        await lc.addSeriesToMainList(x1, x2);
        expect(MainListManager['mainList'].length).toBe(1);
    });


    test('shouldnt clean doubled entrys (1/2)', async () => {
        const testListProvider1 = new TestListProvider(false, true);
        const testListProvider2 = new TestListProvider2(false, true);
        ProviderList['loadedListProvider'] = [];
        ProviderList['loadedListProvider'].push(testListProvider1, testListProvider2);
        const lpld = new ListProviderLocalData(2, TestListProvider);
        lpld.episodes = 12;
        const lpld2 = new ListProviderLocalData(3, TestListProvider2);
        lpld2.episodes = 12;
        const x1 = getFilledAnime();
        x1['infoProviderInfos'] = [];
        x1['listProviderInfos'] = [];
        x1.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld, new Season([1])));

        const x2 = getFilledAnime();
        x2['infoProviderInfos'] = [];
        x2['listProviderInfos'] = [];
        x2.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld2, new Season([2])));

        await lc.addSeriesToMainList(x1, x2);
        expect(MainListManager['mainList'].length).toBe(2);
    });

    test('shouldnt clean doubled entrys (2/2)', () => {
        const lpld = new ListProviderLocalData(2, TestListProvider);
        lpld.episodes = 12;
        const lpld2 = new ListProviderLocalData(3, TestListProvider);
        lpld2.episodes = 12;

        const x1 = getFilledAnime();
        x1['listProviderInfos'] = [];
        x1.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld));

        const x2 = getFilledAnime();
        x2['listProviderInfos'] = [];
        x2.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld2));

        MainListManager['mainList'] = [x1, x2];

        expect(MainListManager['mainList'].length).toBe(2);
    });

    test('should clean doubled entrys (2/2)', async () => {
        const lpld = new ListProviderLocalData(2, TestListProvider);
        lpld.episodes = 12;

        const x1 = getFilledAnime();
        x1['listProviderInfos'] = [];
        x1.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld));


        const x2 = getFilledAnime();
        x2['listProviderInfos'] = [];
        x2.addListProvider(lpld);
        MainListManager['mainList'] = [x1, x2];

        await lc.addSeriesToMainList(x1, x2);

        expect(MainListManager['mainList'].length).toBe(1);
    });

    test('should clean doubled entrys with different season', async () => {
        const lpld = new ListProviderLocalData(2);
        lpld.episodes = 10;
        const x1 = getFilledAnime(TestListProvider, 1, null);
        x1.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld));

        const lpld2 = new ListProviderLocalData(2);
        lpld2.episodes = 10;

        const x2 = getFilledAnime(TestListProvider, 1, 1);
        x2.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld2, new Season([1])));

        MainListManager['mainList'] = [x1, x2];

        await lc.addSeriesToMainList(x1, x2);
        expect(MainListManager['mainList'].length).toBe(1);
    });

    test('should contain last update date', async () => {
        const x1 = getFilledAnime(TestListProvider, 1);
        x1.lastInfoUpdate = 10;
        x1.lastUpdate = 10;
        const x2 = getFilledAnime(TestListProvider, 1);
        x2.lastInfoUpdate = 0;
        x2.lastUpdate = 0;

        await lc.addSeriesToMainList(x1);
        await lc.addSeriesToMainList(x2);
        expect(MainListManager['mainList'][0].lastInfoUpdate).not.toBe(0);
        expect(MainListManager['mainList'][0].lastUpdate).not.toBe(0);
    });
});
