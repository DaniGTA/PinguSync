import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import Name from '../../../src/backend/controller/objects/meta/name';
import Overview from '../../../src/backend/controller/objects/meta/overview';
import Season from '../../../src/backend/controller/objects/meta/season';
import Series from '../../../src/backend/controller/objects/series';
import ProviderDataListManager from '../../../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-manager';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderDataWithSeasonInfo from '../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import logger from '../../../src/backend/logger/logger';
import TestListProvider from './testClass/testListProvider';
import TestListProvider2 from './testClass/testListProvider2';


describe('Series | Merge', () => {
    beforeEach(() => {
        // tslint:disable: no-string-literal
        MainListManager['mainList'] = [];
        ProviderDataListManager['providerDataList'] = [];
    });
    test('should merge episode', async () => {
        const seriesA = new Series();
        const lpld = new ListProviderLocalData(1);
        lpld.addSeriesName(new Name('Test', 'en'));
        lpld.episodes = 10;
        seriesA.addListProvider(lpld);

        const seriesB = new Series();
        const lpld2 = new ListProviderLocalData(1);
        lpld2.episodes = 10;
        seriesB.addListProvider(lpld2);

        const merged = await seriesA.merge(seriesB);
        expect(merged.getMaxEpisode()).toBe(10);
        return;
    });

    test('should generate detailedEpisodes', async () => {
        const seriesA = new Series();
        const lpld = new ListProviderLocalData(1, TestListProvider);
        lpld.addSeriesName(new Name('Test', 'en'));
        lpld.episodes = 10;
        seriesA.addListProvider(lpld);

        const seriesB = new Series();
        const lpld2 = new ListProviderLocalData(2, TestListProvider2);
        lpld2.episodes = 10;
        seriesB.addListProvider(lpld2);

        const merged = await seriesA.merge(seriesB);
        const result = merged.getAllProviderLocalDatas().flatMap(x => x.getAllDetailedEpisodes());
        expect(result.length).toBe(20);
        return;
    });
    test('should merge episode (2)', async () => {
        const seriesA = new Series();
        const lpld = new ListProviderLocalData(1);
        lpld.addSeriesName(new Name('Test', 'en'));
        lpld.episodes = 10;
        seriesA.addListProvider(lpld);
        const seriesB = new Series();
        const merged = await seriesA.merge(seriesB);
        expect(merged.getMaxEpisode()).toBe(10);
        return;
    });
    test('should merge overview', async () => {
        const seriesA = new Series();
        const lpld = new ListProviderLocalData(1);
        lpld.addSeriesName(new Name('Test', 'en'));
        lpld.addOverview(new Overview('Test', 'en'));
        seriesA.addListProvider(lpld);
        const seriesB = new Series();
        const lpld2 = new ListProviderLocalData(1);
        lpld2.addOverview(new Overview('Test', 'en'));
        seriesB.addListProvider(lpld2);


        const merged = await seriesA.merge(seriesB);
        expect(merged.getAllOverviews().length).toBe(1);
        return;
    });
    test('should merge overview (2)', async () => {
        const seriesA = new Series();
        const lpld = new ListProviderLocalData(1);
        lpld.addOverview(new Overview('TestA', 'en'));
        lpld.addSeriesName(new Name('Test', 'en'));
        seriesA.addListProvider(lpld);

        const seriesB = new Series();
        const lpld2 = new ListProviderLocalData(1);
        lpld2.addOverview(new Overview('TestB', 'en'));
        seriesB.addListProvider(lpld2);


        const merged = await seriesA.merge(seriesB);
        expect(merged.getAllOverviews().length).toBe(2);
        return;
    });
    test('should merge overview (3)', async () => {
        const seriesA = new Series();
        const lpld = new ListProviderLocalData(1);
        lpld.addSeriesName(new Name('Test', 'en'));
        lpld.addOverview(new Overview('TestA', 'en'));
        seriesA.addListProvider(lpld);
        const seriesB = new Series();

        const merged = await seriesA.merge(seriesB);
        expect(merged.getAllOverviews().length).toBe(1);
        return;
    });
    test('should merge name', async () => {
        const seriesA = new Series();
        const lpld = new ListProviderLocalData(1);
        lpld.addSeriesName(new Name('Test', 'en'));
        seriesA.addListProvider(lpld);
        const seriesB = new Series();
        const lpld2 = new ListProviderLocalData(1);
        lpld2.addSeriesName(new Name('Test', 'en'));
        seriesB.addListProvider(lpld2);

        const merged = await seriesA.merge(seriesB);
        expect((merged.getAllNames()).length).toBe(1);
        return;
    });
    test('should merge name (2)', async () => {
        const seriesA = new Series();
        const lpld = new ListProviderLocalData(1, TestListProvider);
        lpld.addSeriesName(new Name('TestA', 'en'));
        seriesA.addListProvider(lpld);
        const seriesB = new Series();
        const lpld2 = new ListProviderLocalData(1, TestListProvider2);
        lpld2.addSeriesName(new Name('TestB', 'en'));
        seriesB.addListProvider(lpld2);
        const merged = await seriesA.merge(seriesB);
        expect((merged.getAllNames()).length).toBe(2);
        return;
    });
    test('should merge name (3)', async () => {
        const seriesA = new Series();
        const lpld = new ListProviderLocalData(1);
        lpld.addSeriesName(new Name('TestA', 'en'));
        seriesA.addListProvider(lpld);
        const seriesB = new Series();

        const merged = await seriesA.merge(seriesB);
        const names = merged.getAllNames();
        for (const name of names) {
            logger.info(name);
        }
        expect(names.length).toBe(1);
        return;
    });

    test('should merge listproviderSeason', async () => {
        const seriesA = new Series();
        const lpld = new ListProviderLocalData(2, TestListProvider);
        lpld.addSeriesName(new Name('TestA', 'en'));
        seriesA.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld, new Season([1])));
        const seriesB = new Series();
        const lpld2 = new ListProviderLocalData(2, TestListProvider);
        seriesB.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(lpld2, new Season([1])));

        const merged = await seriesA.merge(seriesB);
        expect((merged.getListProvidersInfos()).length).toBe(1);
        expect(merged.getProviderSeasonTarget((merged.getListProvidersInfos())[0].provider)?.getSingleSeasonNumberAsNumber()).toBe(1);
        return;
    });

});
