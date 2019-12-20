import { strictEqual } from 'assert';
import Name from '../../../src/backend/controller/objects/meta/name';
import Series from '../../../src/backend/controller/objects/series';
import { ProviderInfoStatus } from '../../../src/backend/controller/provider-manager/local-data/interfaces/provider-info-status';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import { SeasonSearchMode } from '../../../src/backend/helpFunctions/season-helper/season-search-mode';
import TestHelper from '../../test-helper';


describe('Series | Season', () => {
    beforeEach(() => {
        TestHelper.mustHaveBefore();
    });

    test('should return season 1', async () => {
        const series = new Series();
        const provider = new ListProviderLocalData(1, 'TestA');
        provider.targetSeason = 1;
        series.addListProvider(provider);
        strictEqual((await series.getSeason()).seasonNumber, 1);
        return;
    });

    test('should return season 2', async () => {
        const series = new Series();
        const provider = new ListProviderLocalData(1, 'TestA');
        provider.addSeriesName(new Name('Test 3', 'en'));
        series.addListProvider(provider);
        strictEqual((await series.getSeason()).seasonNumber, 3);
        return;
    });

    test('should return season 3', async () => {
        const series = new Series();
        const provider = new ListProviderLocalData(1, 'TestA');
        provider.addSeriesName(new Name('Test III', 'en'));
        series.addListProvider(provider);
        strictEqual((await series.getSeason()).seasonNumber, 3);
        return;
    });

    test('should return season 4', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData(1);
        lpld.prequelIds.push(6);
        lpld.addSeriesName(new Name('Test III', 'en'));
        series.addListProvider(lpld);

        strictEqual((await series.getSeason(SeasonSearchMode.ALL, [series])).seasonNumber, 3);
        return;
    });

    test('should return season 5', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData(1);
        lpld.prequelIds.push(6);
        lpld.addSeriesName(new Name('Test III', 'en'));
        series.addListProvider(lpld);

        const series2 = new Series();
        const lpld2 = new ListProviderLocalData(1);
        lpld2.prequelIds.push(5);
        lpld2.sequelIds.push(6);
        lpld2.addSeriesName(new Name('Test II', 'en'));
        series2.addListProvider(lpld2);

        strictEqual((await series.getSeason(SeasonSearchMode.ALL, [series, series2])).seasonNumber, 3);
        return;
    });

    test('should return season 6', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData(1);
        lpld.prequelIds.push(6);
        lpld.addSeriesName(new Name('Test III', 'en'));
        series.addListProvider(lpld);

        const series2 = new Series();
        const lpld2 = new ListProviderLocalData(1);
        lpld2.prequelIds.push(5);
        lpld2.sequelIds.push(6);
        lpld2.addSeriesName(new Name('Test II', 'en'));
        series2.addListProvider(lpld2);

        strictEqual((await series2.getSeason(SeasonSearchMode.ALL, [series, series2])).seasonNumber, 2);
        return;
    });

    test('should return season 7', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData(6, 'Test');
        lpld.prequelIds.push(5);
        lpld.addSeriesName(new Name('Test Cool', 'en'));
        series.addListProvider(lpld);

        const series2 = new Series();
        const lpld2 = new ListProviderLocalData(5, 'Test');
        lpld2.sequelIds.push(6);
        lpld2.addSeriesName(new Name('Test Test', 'en'));
        series2.addListProvider(lpld2);

        strictEqual((await series.getSeason(SeasonSearchMode.ALL, [series, series2])).seasonNumber, 2);
        strictEqual((await series2.getSeason(SeasonSearchMode.ALL, [series, series2])).seasonNumber, 1);
        return;
    });
    describe('should return season 8', () => {
        let series: Series = new Series();

        let series2: Series = new Series();

        let series3: Series = new Series();

        beforeEach(() => {
            series = new Series();
            const lpld = new ListProviderLocalData(5);
            lpld.sequelIds.push(6);
            lpld.addSeriesName(new Name('Test Cool', 'en'));
            series.addListProvider(lpld);

            series2 = new Series();
            const lpld2 = new ListProviderLocalData(6);
            lpld2.sequelIds.push(7);
            lpld2.prequelIds.push(5);
            lpld2.addSeriesName(new Name('Test Test', 'en'));
            series2.addListProvider(lpld2);

            series3 = new Series();
            const lpld3 = new ListProviderLocalData(7);
            lpld3.prequelIds.push(6);
            lpld3.addSeriesName(new Name('Test Testooo', 'en'));
            series3.addListProvider(lpld3);
        });
        test('at season 1', async () => {
            strictEqual((await series.getSeason(SeasonSearchMode.ALL, [series, series2, series3])).seasonNumber, 1);
            return;
        });

        test('at season 2', async () => {
            strictEqual((await series2.getSeason(SeasonSearchMode.ALL, [series, series2, series3])).seasonNumber, 2);
            return;
        });

        test('at season 3', async () => {
            strictEqual((await series3.getSeason(SeasonSearchMode.ALL, [series, series2, series3])).seasonNumber, 3);
            return;
        });
    });

    test('should return season 9', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData(1);
        lpld.sequelIds.push(6);
        lpld.addSeriesName(new Name('Test', 'en'));
        series.addListProvider(lpld);

        strictEqual((await series.getSeason(SeasonSearchMode.ALL, [series])).seasonNumber, 1);
        return;
    });

    test('should not return season 10', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData(1);
        lpld.addSeriesName(new Name('Title xx', 'eng'));
        lpld.addSeriesName(new Name('Title XX', 'eng'));
        series.addListProvider(lpld);
        strictEqual((await series.getSeason()).seasonNumber, 2);
        return;
    });

    test('should not return season 2', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData(1);
        lpld.addSeriesName(new Name('Test S3 part 2', 'en'));
        series.addListProvider(lpld);
        strictEqual((await series.getSeason()).seasonNumber, 3);
        return;
    });

    test('should not return any season', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData(3);
        lpld.infoStatus = ProviderInfoStatus.ONLY_ID;
        series.addListProvider(lpld);

        const series2 = new Series();
        const lpld2 = new ListProviderLocalData(1);
        lpld2.addSeriesName(new Name('Test: yman', 'en'));
        lpld2.sequelIds.push(3);
        series2.addListProvider(lpld2);



        strictEqual((await series.getSeason()).seasonNumber, undefined);
        return;
    });


    test('should not return season (1/3)', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData(1);
        lpld.addSeriesName(new Name('test-2017-127567', 'slug'));
        series.addListProvider(lpld);
        strictEqual((await series.getSeason()).seasonNumber, undefined);
        return;
    });

    test('should not return season (2/3)', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData(1);
        lpld.addSeriesName(new Name('test-test-2013', 'slug'));
        series.addListProvider(lpld);
        strictEqual((await series.getSeason()).seasonNumber, undefined);
        return;
    });

    test('should return season 1 (3/3)', async () => {
        const series = new Series();
        const lpld = new ListProviderLocalData(1);
        lpld.addSeriesName(new Name('test', 'eng'));
        lpld.sequelIds.push(199);
        series.addListProvider(lpld);
        const result = await series.getSeason();
        strictEqual(result.seasonNumber, 1);
        return;
    });

});
