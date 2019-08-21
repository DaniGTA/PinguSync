import Series from "../../../src/backend/controller/objects/series";
import { strictEqual } from 'assert';
import Overview from '../../../src/backend/controller/objects/meta/overview';
import Name from '../../../src/backend/controller/objects/meta/name';
import { ListProviderLocalData } from '../../../src/backend/controller/objects/list-provider-local-data';

describe('seriesTest | Merge', () => {
    it('should merge episode', async () => {
        const seriesA = new Series();
        seriesA.addSeriesName(new Name('Test', 'en'));
        seriesA['episodes'] = 10;
        const seriesB = new Series();
        seriesB['episodes'] = 10;

        const merged = await seriesA.merge(seriesB);
        strictEqual(seriesA.getMaxEpisode(), 10);
        return;
    });
    it('should merge episode (2)', async () => {
        const seriesA = new Series();
        seriesA.addSeriesName(new Name('Test', 'en'));
        seriesA['episodes'] = 10;
        const seriesB = new Series();

        const merged = await seriesA.merge(seriesB);
        strictEqual(seriesA.getMaxEpisode(), 10);
        return;
    });
    it('should merge overview', async () => {
        const seriesA = new Series();
        seriesA.addSeriesName(new Name('Test', 'en'));
        seriesA.addOverview(new Overview('Test', 'en'));
        const seriesB = new Series();
        seriesB.addOverview(new Overview('Test', 'en'));

        const merged = await seriesA.merge(seriesB);
        strictEqual(merged.overviews.length, 1);
        return;
    });
    it('should merge overview (2)', async () => {
        const seriesA = new Series();
        seriesA.addOverview(new Overview('TestA', 'en'));
        seriesA.addSeriesName(new Name('Test', 'en'));
        const seriesB = new Series();
        seriesB.addOverview(new Overview('TestB', 'en'));

        const merged = await seriesA.merge(seriesB);
        strictEqual(merged.overviews.length, 2);
        return;
    });
    it('should merge overview (3)', async () => {
        const seriesA = new Series();
        seriesA.addSeriesName(new Name('Test', 'en'));
        seriesA.addOverview(new Overview('TestA', 'en'));
        const seriesB = new Series();

        const merged = await seriesA.merge(seriesB);
        strictEqual(merged.overviews.length, 1);
        return;
    });
    it('should merge name', async () => {
        const seriesA = new Series();
        seriesA.addSeriesName(new Name('Test', 'en'));
        const seriesB = new Series();
        seriesB.addSeriesName(new Name('Test', 'en'));

        const merged = await seriesA.merge(seriesB);
        strictEqual((await merged.getAllNames()).length, 1);
        return;
    });
    it('should merge name (2)', async () => {
        const seriesA = new Series();
        seriesA.addSeriesName(new Name('TestA', 'en'));
        const seriesB = new Series();
        seriesB.addSeriesName(new Name('TestB', 'en'));

        const merged = await seriesA.merge(seriesB);
        strictEqual((await merged.getAllNames()).length, 2);
        return;
    });
    it('should merge name (3)', async () => {
        const seriesA = new Series();
        seriesA.addSeriesName(new Name('TestA', 'en'));
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
        seriesA.addSeriesName(new Name('TestA', 'en'));
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
