import { strictEqual } from "assert";
import Name from "../../../src/backend/controller/objects/meta/name";
import Series from "../../../src/backend/controller/objects/series";
import { ListProviderLocalData } from "../../../src/backend/controller/objects/list-provider-local-data";

describe('seriesTest | Season', () => {
    it('should return season 1', async () => {
        const series = new Series();
        const provider = new ListProviderLocalData("TestA");
        provider.targetSeason = 1;
        series.addListProvider(provider);
        strictEqual(await series.getSeason(), 1);
        return;
    });

    it('should return season 2', async () => {
        const series = new Series();
        series.addSeriesName(new Name('Test 3', 'en'));

        strictEqual(await series.getSeason(), 3);
        return;
    });

    it('should return season 3', async () => {
        const series = new Series();
        series.addSeriesName(new Name('Test III', 'en'));

        strictEqual(await series.getSeason(), 3);
        return;
    });

    it('should return season 4', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData();
        lpld.prequelIds.push(6);
        series.addListProvider(lpld);
        series.addSeriesName(new Name('Test III', 'en'));

        strictEqual(await series.getSeason([series]), 3);
        return;
    });

    it('should return season 5', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData();
        lpld.prequelIds.push(6);
        series.addListProvider(lpld);
        series.addSeriesName(new Name('Test III', 'en'));

        const series2 = new Series();
        const lpld2 = new ListProviderLocalData();
        lpld2.prequelIds.push(5);
        lpld2.sequelIds.push(6);
        series2.addListProvider(lpld2);
        series2.addSeriesName(new Name('Test II', 'en'));

        strictEqual(await series.getSeason([series, series2]), 3);
        return;
    });

    it('should return season 6', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData();
        lpld.prequelIds.push(6);
        series.addListProvider(lpld);
        series.addSeriesName(new Name('Test III', 'en'));

        const series2 = new Series();
        const lpld2 = new ListProviderLocalData();
        lpld2.prequelIds.push(5);
        lpld2.sequelIds.push(6);
        series2.addListProvider(lpld2);
        series2.addSeriesName(new Name('Test II', 'en'));

        strictEqual(await series2.getSeason([series, series2]), 2);
        return;
    });

    it('should return season 7', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData("Test");
        lpld.prequelIds.push(5);
        lpld.id = 6;
        series.addListProvider(lpld);
        series.addSeriesName(new Name('Test Cool', 'en'));

        const series2 = new Series();
        const lpld2 = new ListProviderLocalData("Test");
        lpld2.sequelIds.push(6);
        lpld2.id = 5;
        series2.addListProvider(lpld2);
        series2.addSeriesName(new Name('Test Test', 'en'));

        strictEqual(await series.getSeason([series, series2]), 2);
        strictEqual(await series2.getSeason([series, series2]), 1);
        return;
    });

    it('should return season 8', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData();
        lpld.sequelIds.push(6);
        lpld.id = 5;
        series.addListProvider(lpld);
        series.addSeriesName(new Name('Test Cool', 'en'));

        const series2 = new Series();
        const lpld2 = new ListProviderLocalData();
        lpld2.sequelIds.push(7);
        lpld2.prequelIds.push(5);
        lpld2.id = 6;
        series2.addListProvider(lpld2);
        series2.addSeriesName(new Name('Test Test', 'en'));

        const series3 = new Series();
        const lpld3 = new ListProviderLocalData();
        lpld3.prequelIds.push(6);
        lpld3.id = 7;
        series3.addListProvider(lpld3);
        series3.addSeriesName(new Name('Test Testooo', 'en'));

        strictEqual(await series.getSeason([series, series2, series3]), 1);
        strictEqual(await series2.getSeason([series, series2, series3]), 2);
        strictEqual(await series3.getSeason([series, series2, series3]), 3);
        return;
    });

    it('should return season 9', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData();
        lpld.sequelIds.push(6);
        series.addListProvider(lpld);
        series.addSeriesName(new Name('Test', 'en'));

        strictEqual(await series.getSeason([series]), 1);
        return;
    });

    it('should not return season 2', async () => {
        const series = new Series();
        series.addSeriesName(new Name('Test S3 part 2', 'en'));

        strictEqual(await series.getSeason(), undefined);
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
