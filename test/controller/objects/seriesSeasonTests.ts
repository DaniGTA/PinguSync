import { strictEqual } from "assert";
import Name from "../../../src/backend/controller/objects/meta/name";
import Series from "../../../src/backend/controller/objects/series";
import { ListProviderLocalData } from "../../../src/backend/controller/objects/list-provider-local-data";
import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import MainListLoader from '../../../src/backend/controller/main-list-manager/main-list-loader';
import { SeasonSearchMode } from '../../../src/backend/helpFunctions/season-helper/season-search-mode';

describe('Series | Season', () => {
    before(() => {
        MainListManager['listLoaded'] = true;
        MainListLoader['loadData'] = () => { return [] };
        MainListLoader['saveData'] = async () => { };
    })

    it('should return season 1', async () => {
        const series = new Series();
        const provider = new ListProviderLocalData("TestA");
        provider.targetSeason = 1;
        series.addListProvider(provider);
        strictEqual((await series.getSeason()).seasonNumber, 1);
        return;
    });

    it('should return season 2', async () => {
        const series = new Series();
        const provider = new ListProviderLocalData("TestA");
        provider.addSeriesName(new Name('Test 3', 'en'));
        series.addListProvider(provider);
        strictEqual((await series.getSeason()).seasonNumber, 3);
        return;
    });

    it('should return season 3', async () => {
        const series = new Series();
        const provider = new ListProviderLocalData("TestA");
        provider.addSeriesName(new Name('Test III', 'en'));
        series.addListProvider(provider);
        strictEqual((await series.getSeason()).seasonNumber, 3);
        return;
    });

    it('should return season 4', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData();
        lpld.prequelIds.push(6);
        lpld.addSeriesName(new Name('Test III', 'en'));
        series.addListProvider(lpld);

        strictEqual((await series.getSeason(SeasonSearchMode.ALL, [series])).seasonNumber, 3);
        return;
    });

    it('should return season 5', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData();
        lpld.prequelIds.push(6);
        lpld.addSeriesName(new Name('Test III', 'en'));
        series.addListProvider(lpld);

        const series2 = new Series();
        const lpld2 = new ListProviderLocalData();
        lpld2.prequelIds.push(5);
        lpld2.sequelIds.push(6);
        lpld2.addSeriesName(new Name('Test II', 'en'));
        series2.addListProvider(lpld2);

        strictEqual((await series.getSeason(SeasonSearchMode.ALL, [series, series2])).seasonNumber, 3);
        return;
    });

    it('should return season 6', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData();
        lpld.prequelIds.push(6);
        lpld.addSeriesName(new Name('Test III', 'en'));
        series.addListProvider(lpld);

        const series2 = new Series();
        const lpld2 = new ListProviderLocalData();
        lpld2.prequelIds.push(5);
        lpld2.sequelIds.push(6);
        lpld2.addSeriesName(new Name('Test II', 'en'));
        series2.addListProvider(lpld2);

        strictEqual((await series2.getSeason(SeasonSearchMode.ALL, [series, series2])).seasonNumber, 2);
        return;
    });

    it('should return season 7', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData("Test");
        lpld.prequelIds.push(5);
        lpld.id = 6;
        lpld.addSeriesName(new Name('Test Cool', 'en'));
        series.addListProvider(lpld);

        const series2 = new Series();
        const lpld2 = new ListProviderLocalData("Test");
        lpld2.sequelIds.push(6);
        lpld2.id = 5;
        lpld2.addSeriesName(new Name('Test Test', 'en'));
        series2.addListProvider(lpld2);

        strictEqual((await series.getSeason(SeasonSearchMode.ALL, [series, series2])).seasonNumber, 2);
        strictEqual((await series2.getSeason(SeasonSearchMode.ALL, [series, series2])).seasonNumber, 1);
        return;
    });

    it('should return season 8', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData();
        lpld.sequelIds.push(6);
        lpld.id = 5;
        lpld.addSeriesName(new Name('Test Cool', 'en'));
        series.addListProvider(lpld);

        const series2 = new Series();
        const lpld2 = new ListProviderLocalData();
        lpld2.sequelIds.push(7);
        lpld2.prequelIds.push(5);
        lpld2.id = 6;
        lpld2.addSeriesName(new Name('Test Test', 'en'));
        series2.addListProvider(lpld2);

        const series3 = new Series();
        const lpld3 = new ListProviderLocalData();
        lpld3.prequelIds.push(6);
        lpld3.id = 7;
        lpld3.addSeriesName(new Name('Test Testooo', 'en'));
        series3.addListProvider(lpld3);

        strictEqual((await series.getSeason(SeasonSearchMode.ALL, [series, series2, series3])).seasonNumber, 1);
        strictEqual((await series2.getSeason(SeasonSearchMode.ALL, [series, series2, series3])).seasonNumber, 2);
        strictEqual((await series3.getSeason(SeasonSearchMode.ALL, [series, series2, series3])).seasonNumber, 3);
        return;
    });

    it('should return season 9', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData();
        lpld.sequelIds.push(6);
        lpld.addSeriesName(new Name('Test', 'en'));
        series.addListProvider(lpld);

        strictEqual((await series.getSeason(SeasonSearchMode.ALL, [series])).seasonNumber, 1);
        return;
    });

    it('should not return season 10', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData();
        lpld.addSeriesName(new Name('Title xx', 'eng'));
        lpld.addSeriesName(new Name('Title XX', 'eng'));
        series.addListProvider(lpld);
        strictEqual((await series.getSeason()).seasonNumber, 2);
        return;
    });

    it('should not return season 2', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData();
        lpld.addSeriesName(new Name('Test S3 part 2', 'en'));
        series.addListProvider(lpld);
        strictEqual((await series.getSeason()).seasonNumber, undefined);
        return;
    });

    it('should not return season (1/3)', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData();
        lpld.addSeriesName(new Name('test-2017-127567', 'slug'));
        series.addListProvider(lpld);
        strictEqual((await series.getSeason()).seasonNumber, undefined);
        return;
    });

    it('should not return season (2/3)', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData();
        lpld.addSeriesName(new Name('test-test-2013', 'slug'));
        series.addListProvider(lpld);
        strictEqual((await series.getSeason()).seasonNumber, undefined);
        return;
    });

    it('should return season 1 (3/3)', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData();
        lpld.addSeriesName(new Name('test', 'eng'));
        lpld.sequelIds.push(199);
        series.addListProvider(lpld);
        const result = await series.getSeason();
        console.log(result);
        strictEqual(result.seasonNumber, 1);
        return;
    });

});
