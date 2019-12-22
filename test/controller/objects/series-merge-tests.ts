import { strictEqual } from 'assert';
import Name from '../../../src/backend/controller/objects/meta/name';
import Overview from '../../../src/backend/controller/objects/meta/overview';
import Series from '../../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import logger from '../../../src/backend/logger/logger';
import TestHelper from '../../test-helper';


describe('Series | Merge', () => {
    beforeEach(() => {
        TestHelper.mustHaveBefore();
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
        await seriesB.addListProvider(lpld2);

        const merged = await seriesA.merge(seriesB);
        strictEqual(merged.getMaxEpisode(), 10);
        return;
    });

    test('should generate detailedEpisodes', async () => {
        const seriesA = new Series();
        const lpld = new ListProviderLocalData(1, 'test');
        lpld.addSeriesName(new Name('Test', 'en'));
        lpld.episodes = 10;
        seriesA.addListProvider(lpld);

        const seriesB = new Series();
        const lpld2 = new ListProviderLocalData(2, 'test2');
        lpld2.episodes = 10;
        await seriesB.addListProvider(lpld2);

        const merged = await seriesA.merge(seriesB);
        const result = await merged.getAllDetailedEpisodes();
        strictEqual(result.length, 20);
        return;
    });
    test('should merge episode (2)', async () => {
        const seriesA = new Series();
        const lpld = new ListProviderLocalData(1);
        lpld.addSeriesName(new Name('Test', 'en'));
        lpld.episodes = 10;
        await seriesA.addListProvider(lpld);
        const seriesB = new Series();
        const merged = await seriesA.merge(seriesB);
        strictEqual(merged.getMaxEpisode(), 10);
        return;
    });
    test('should merge overview', async () => {
        const seriesA = new Series();
        const lpld = new ListProviderLocalData(1);
        lpld.addSeriesName(new Name('Test', 'en'));
        lpld.addOverview(new Overview('Test', 'en'));
        await seriesA.addListProvider(lpld);
        const seriesB = new Series();
        const lpld2 = new ListProviderLocalData(1);
        lpld2.addOverview(new Overview('Test', 'en'));
        await seriesB.addListProvider(lpld2);


        const merged = await seriesA.merge(seriesB);
        strictEqual((await merged.getAllOverviews()).length, 1);
        return;
    });
    test('should merge overview (2)', async () => {
        const seriesA = new Series();
        const lpld = new ListProviderLocalData(1);
        lpld.addOverview(new Overview('TestA', 'en'));
        lpld.addSeriesName(new Name('Test', 'en'));
        await seriesA.addListProvider(lpld);

        const seriesB = new Series();
        const lpld2 = new ListProviderLocalData(1);
        lpld2.addOverview(new Overview('TestB', 'en'));
        await seriesB.addListProvider(lpld2);


        const merged = await seriesA.merge(seriesB);
        strictEqual((await merged.getAllOverviews()).length, 2);
        return;
    });
    test('should merge overview (3)', async () => {
        const seriesA = new Series();
        const lpld = new ListProviderLocalData(1);
        lpld.addSeriesName(new Name('Test', 'en'));
        lpld.addOverview(new Overview('TestA', 'en'));
        await seriesA.addListProvider(lpld);
        const seriesB = new Series();

        const merged = await seriesA.merge(seriesB);
        strictEqual((await merged.getAllOverviews()).length, 1);
        return;
    });
    test('should merge name', async () => {
        const seriesA = new Series();
        const lpld = new ListProviderLocalData(1);
        lpld.addSeriesName(new Name('Test', 'en'));
        await seriesA.addListProvider(lpld);
        const seriesB = new Series();
        const lpld2 = new ListProviderLocalData(1);
        lpld2.addSeriesName(new Name('Test', 'en'));
        await seriesB.addListProvider(lpld2);

        const merged = await seriesA.merge(seriesB);
        strictEqual((await merged.getAllNames()).length, 1);
        return;
    });
    test('should merge name (2)', async () => {
        const seriesA = new Series();
        const lpld = new ListProviderLocalData(1, 'A');
        lpld.addSeriesName(new Name('TestA', 'en'));
        await seriesA.addListProvider(lpld);
        const seriesB = new Series();
        const lpld2 = new ListProviderLocalData(1, 'B');
        lpld2.addSeriesName(new Name('TestB', 'en'));
        await seriesB.addListProvider(lpld2);
        const merged = await seriesA.merge(seriesB);
        strictEqual((await merged.getAllNames()).length, 2);
        return;
    });
    test('should merge name (3)', async () => {
        const seriesA = new Series();
        const lpld = new ListProviderLocalData(1);
        lpld.addSeriesName(new Name('TestA', 'en'));
        await seriesA.addListProvider(lpld);
        const seriesB = new Series();

        const merged = await seriesA.merge(seriesB);
        const names = await merged.getAllNames();
        for (const name of names) {
            logger.info(name);
        }
        strictEqual(names.length, 1);
        return;
    });

    test('should merge listproviderSeason', async () => {
        const seriesA = new Series();
        const lpld = new ListProviderLocalData(2, 'Test');
        lpld.targetSeason = 1;
        lpld.addSeriesName(new Name('TestA', 'en'));
        await seriesA.addListProvider(lpld);
        const seriesB = new Series();
        const lpld2 = new ListProviderLocalData(2, 'Test');
        lpld2.targetSeason = 1;
        await seriesB.addListProvider(lpld2);

        const merged = await seriesA.merge(seriesB);
        strictEqual((await merged.getListProvidersInfos()).length, 1);
        strictEqual((await merged.getListProvidersInfos())[0].targetSeason, 1);
        return;
    });

});
