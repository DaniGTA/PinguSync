import Series from "../../../src/backend/controller/objects/series";
import { strictEqual } from 'assert';
import Overview from '../../../src/backend/controller/objects/meta/overview';
import Name from '../../../src/backend/controller/objects/meta/name';
import { ListProviderLocalData } from '../../../src/backend/controller/objects/list-provider-local-data';

describe('seriesTest | Merge', () => {
    it('should merge episode', async () => {
        const seriesA = new Series();
        const lpld = new ListProviderLocalData();
        lpld.addSeriesName(new Name('Test', 'en'));
        lpld['episodes'] = 10;
        seriesA.addListProvider(lpld);

        const seriesB = new Series();
        const lpld2 = new ListProviderLocalData();
        lpld2['episodes'] = 10;
        seriesB.addListProvider(lpld2);

        const merged = await seriesA.merge(seriesB);
        strictEqual(merged.getMaxEpisode(), 10);
        return;
    });
    it('should merge episode (2)', async () => {
        const seriesA = new Series();
        const lpld = new ListProviderLocalData();
        lpld.addSeriesName(new Name('Test', 'en'));
        lpld['episodes'] = 10;
        seriesA.addListProvider(lpld);
        const seriesB = new Series();
        const merged = await seriesA.merge(seriesB);
        strictEqual(merged.getMaxEpisode(), 10);
        return;
    });
    it('should merge overview', async () => {
        const seriesA = new Series();
           const lpld = new ListProviderLocalData();
        lpld.addSeriesName(new Name('Test', 'en'));
        lpld.addOverview(new Overview('Test', 'en'));
            seriesA.addListProvider(lpld);
        const seriesB = new Series();
         const lpld2 = new ListProviderLocalData();
        lpld2.addOverview(new Overview('Test', 'en'));
        seriesB.addListProvider(lpld2);


        const merged = await seriesA.merge(seriesB);
        strictEqual((await merged.getAllOverviews()).length, 1);
        return;
    });
    it('should merge overview (2)', async () => {
        const seriesA = new Series();
        const lpld = new ListProviderLocalData();
        lpld.addOverview(new Overview('TestA', 'en'));
        lpld.addSeriesName(new Name('Test', 'en'));
        seriesA.addListProvider(lpld);

        const seriesB = new Series();
        const lpld2 = new ListProviderLocalData();
        lpld2.addOverview(new Overview('TestB', 'en'));
        seriesB.addListProvider(lpld2);


        const merged = await seriesA.merge(seriesB);
        strictEqual((await merged.getAllOverviews()).length, 2);
        return;
    });
    it('should merge overview (3)', async () => {
        const seriesA = new Series();
        const lpld = new ListProviderLocalData();
        lpld.addSeriesName(new Name('Test', 'en'));
        lpld.addOverview(new Overview('TestA', 'en'));
        seriesA.addListProvider(lpld);
        const seriesB = new Series();

        const merged = await seriesA.merge(seriesB);
        strictEqual((await merged.getAllOverviews()).length, 1);
        return;
    });
    it('should merge name', async () => {
        const seriesA = new Series();
            const lpld = new ListProviderLocalData();
        lpld.addSeriesName(new Name('Test', 'en'));
          seriesA.addListProvider(lpld);
        const seriesB = new Series();
            const lpld2 = new ListProviderLocalData();
        lpld2.addSeriesName(new Name('Test', 'en'));
          seriesB.addListProvider(lpld2);

        const merged = await seriesA.merge(seriesB);
        strictEqual((await merged.getAllNames()).length, 1);
        return;
    });
    it('should merge name (2)', async () => {
        const seriesA = new Series();
          const lpld = new ListProviderLocalData();
        lpld.addSeriesName(new Name('TestA', 'en'));
        seriesA.addListProvider(lpld);
        const seriesB = new Series();
          const lpld2 = new ListProviderLocalData();
        lpld2.addSeriesName(new Name('TestB', 'en'));
        seriesB.addListProvider(lpld2);
        const merged = await seriesA.merge(seriesB);
        strictEqual((await merged.getAllNames()).length, 2);
        return;
    });
    it('should merge name (3)', async () => {
        const seriesA = new Series();
         const lpld = new ListProviderLocalData();
        lpld.addSeriesName(new Name('TestA', 'en'));
         seriesA.addListProvider(lpld);
        const seriesB = new Series();

        const merged = await seriesA.merge(seriesB);
        strictEqual((await merged.getAllNames()).length, 1);
        return;
    });

    it('should merge listproviderSeason', async () => {
        const seriesA = new Series();
        const lpld = new ListProviderLocalData("Test");
        lpld.targetSeason = 1;
        lpld.id = 2;
        lpld.addSeriesName(new Name('TestA', 'en'));
        seriesA.addListProvider(lpld);
        const seriesB = new Series();
        const lpld2 = new ListProviderLocalData("Test");
        lpld2.targetSeason = 1;
        lpld2.id = 2;
        seriesB.addListProvider(lpld2);

        const merged = await seriesA.merge(seriesB);
        strictEqual((await merged.getListProvidersInfos()).length, 1);
        strictEqual((await merged.getListProvidersInfos())[0].targetSeason, 1);
        return;
    });

});
