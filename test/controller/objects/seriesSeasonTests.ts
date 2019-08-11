import { strictEqual } from "assert";
import Name from "../../../src/backend/controller/objects/meta/name";
import Series from "../../../src/backend/controller/objects/series";
import { ListProviderLocalData } from "../../../src/backend/controller/objects/listProviderLocalData";

describe('seriesTest | Season', () => {
        it('should return season (1/6)', async () => {
        const series = new Series();
        const provider = new ListProviderLocalData("TestA");
        provider.targetSeason = 1;
        series.addListProvider(provider);
        strictEqual(await series.getSeason(), 1);
        return;
    });

    it('should return season (2/6)', async () => {
        const series = new Series();
        series.addSeriesName(new Name('Test 3', 'en'));

       strictEqual(await series.getSeason(), 3);
        return;
    });

    it('should return season (3/6)', async () => {
        const series = new Series();
        series.addSeriesName(new Name('Test III', 'en'));

        strictEqual(await series.getSeason(), 3);
        return;
    });

    it('should return season (4/6)', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData();
        lpld.prequelId = 6;
        series.addListProvider(lpld);
        series.addSeriesName(new Name('Test III', 'en'));

        strictEqual(await series.getSeason([series]), 3);
        return;
    });

    it('should return season (5/6)', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData();
        lpld.prequelId = 6;
        series.addListProvider(lpld);
        series.addSeriesName(new Name('Test III', 'en'));

        const series2 = new Series();
        const lpld2 = new ListProviderLocalData();
        lpld2.prequelId = 5;
        lpld2.sequelId = 6;
        series2.addListProvider(lpld);
        series2.addSeriesName(new Name('Test II', 'en'));

        strictEqual(await series.getSeason([series,series2]), 3);
        return;
    });

    it('should return season (6/6)', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData();
        lpld.prequelId = 6;
        series.addListProvider(lpld);
        series.addSeriesName(new Name('Test III', 'en'));

        const series2 = new Series();
        const lpld2 = new ListProviderLocalData();
        lpld2.prequelId = 5;
        lpld2.sequelId = 6;
        series2.addListProvider(lpld);
        series2.addSeriesName(new Name('Test II', 'en'));

        strictEqual(await series2.getSeason([series,series2]), 2);
        return;
    });

    it('should not return season (1/2)', async () => {
        const series = new Series();
        series.addSeriesName(new Name('test-2017-127567', 'slug'));

        strictEqual(await series.getSeason(), undefined);
        return;
    });

    it('should not return season (2/2)', async () => {
        const series = new Series();
        series.addSeriesName(new Name('test-test-2013', 'slug'));

        strictEqual(await series.getSeason(), undefined);
        return;
    });

});