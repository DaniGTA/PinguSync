import Name from '../../../src/backend/controller/objects/meta/name';
import Season from '../../../src/backend/controller/objects/meta/season';
import Series from '../../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import listHelper from '../../../src/backend/helpFunctions/list-helper';
import ProviderDataWithSeasonInfo from '../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import TestListProvider from './testClass/testListProvider';

describe('Series | Relations', () => {

    beforeEach(() => {
        const testListProvider = new TestListProvider();
        testListProvider.hasUniqueIdForSeasons = false;
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'] = ProviderList.getListProviderList();
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'].push(testListProvider);
    });

    function getFilledAnime(id: string | number = 1, targetSeason = 3): Series {
        const provider = new ListProviderLocalData(id, TestListProvider);
        const anime = new Series();
        provider.addSeriesName(new Name('Test', 'en'));
        // tslint:disable-next-line: no-string-literal
        provider['episodes'] = 10;
        provider.releaseYear = 2014;
        anime.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(provider, new Season(targetSeason)));
        return anime;
    }
    test('get all Relations based on prequel id', () => {
        const series1 = getFilledAnime(1);
        const series2 = getFilledAnime(2);
        series2.getListProvidersInfos()[0].prequelIds.push(1);
        const series3 = getFilledAnime(3);
        series3.getListProvidersInfos()[0].prequelIds.push(2);
        const series4 = getFilledAnime(4);

        let list = [series1, series2, series3, series4];
        list = listHelper.shuffle(list);
        const result1 = series1.getAllRelations(list);
        const result2 = series2.getAllRelations(list);
        const result3 = series3.getAllRelations(list);

        expect(result1.length).toBe(2);
        expect(result2.length).toBe(2);
        expect(result3.length).toBe(2);

        expect(listHelper.isSeriesInList(result1, series1)).toBe(false);
        expect(listHelper.isSeriesInList(result2, series2)).toBe(false);
        expect(listHelper.isSeriesInList(result3, series3)).toBe(false);


        expect(listHelper.isSeriesInList(result1, series4)).toBe(false);
        expect(listHelper.isSeriesInList(result2, series4)).toBe(false);
        expect(listHelper.isSeriesInList(result3, series4)).toBe(false);
    });

    test('get all Relations based on sequel id', () => {
        const series1 = getFilledAnime(1);
        series1.getListProvidersInfos()[0].sequelIds.push(2);
        const series2 = getFilledAnime(2);
        series2.getListProvidersInfos()[0].sequelIds.push(3);
        const series3 = getFilledAnime(3);
        const series4 = getFilledAnime(4);

        let list = [series1, series2, series3, series4];
        list = listHelper.shuffle(list);
        const result1 = series1.getAllRelations(list);
        const result2 = series2.getAllRelations(list);
        const result3 = series3.getAllRelations(list);

        expect(result1.length).toBe(2);
        expect(result2.length).toBe(2);
        expect(result3.length).toBe(2);

        expect(listHelper.isSeriesInList(result1, series1)).toBe(false);
        expect(listHelper.isSeriesInList(result2, series2)).toBe(false);
        expect(listHelper.isSeriesInList(result3, series3)).toBe(false);


        expect(listHelper.isSeriesInList(result1, series4)).toBe(false);
        expect(listHelper.isSeriesInList(result2, series4)).toBe(false);
        expect(listHelper.isSeriesInList(result3, series4)).toBe(false);
    });

    test('get all Relations based on sequel id and prequel id', () => {
        const series1 = getFilledAnime(1);
        series1.getListProvidersInfos()[0].sequelIds.push(2);
        const series2 = getFilledAnime(2);
        series2.getListProvidersInfos()[0].sequelIds.push(3);
        series2.getListProvidersInfos()[0].prequelIds.push(1);
        const series3 = getFilledAnime(3);
        series2.getListProvidersInfos()[0].prequelIds.push(2);
        const series4 = getFilledAnime(4);

        let list = [series1, series2, series3, series4];
        list = listHelper.shuffle(list);
        const result1 = series1.getAllRelations(list);
        const result2 = series2.getAllRelations(list);
        const result3 = series3.getAllRelations(list);

        expect(result1.length).toBe(2);
        expect(result2.length).toBe(2);
        expect(result3.length).toBe(2);

        expect(listHelper.isSeriesInList(result1, series1)).toBe(false);
        expect(listHelper.isSeriesInList(result2, series2)).toBe(false);
        expect(listHelper.isSeriesInList(result3, series3)).toBe(false);

        expect(listHelper.isSeriesInList(result1, series4)).toBe(false);
        expect(listHelper.isSeriesInList(result2, series4)).toBe(false);
        expect(listHelper.isSeriesInList(result3, series4)).toBe(false);
    });

    test('get all Relations based on provider id', () => {
        const series1 = getFilledAnime(1, 1);
        const series2 = getFilledAnime(1, 2);
        const series3 = getFilledAnime(1, 3);
        const series4 = getFilledAnime(4);

        let list = [series1, series2, series3, series4];
        list = listHelper.shuffle(list);
        const result1 = series1.getAllRelations(list);
        const result2 = series2.getAllRelations(list);
        const result3 = series3.getAllRelations(list);

        expect(result1.length).toBe(2);
        expect(result2.length).toBe(2);
        expect(result3.length).toBe(2);

        expect(listHelper.isSeriesInList(result1, series1)).toBe(false);
        expect(listHelper.isSeriesInList(result2, series2)).toBe(false);
        expect(listHelper.isSeriesInList(result3, series3)).toBe(false);

        expect(listHelper.isSeriesInList(result1, series4)).toBe(false);
        expect(listHelper.isSeriesInList(result2, series4)).toBe(false);
        expect(listHelper.isSeriesInList(result3, series4)).toBe(false);
    });

    test('get all Relations based on multi sequels id', () => {
        const series1 = getFilledAnime(1);
        series1.getListProvidersInfos()[0].sequelIds.push(2);
        series1.getListProvidersInfos()[0].sequelIds.push(3);
        const series2 = getFilledAnime(2);
        series2.getListProvidersInfos()[0].sequelIds.push(5);
        const series3 = getFilledAnime(3);
        series3.getListProvidersInfos()[0].sequelIds.push(4);
        series3.getListProvidersInfos()[0].prequelIds.push(1);
        const series4 = getFilledAnime(4);
        series4.getListProvidersInfos()[0].prequelIds.push(3);
        const series5 = getFilledAnime(5);
        series5.getListProvidersInfos()[0].sequelIds.push(6);
        series5.getListProvidersInfos()[0].prequelIds.push(2);
        const series6 = getFilledAnime(6);

        let list = [series1, series2, series3, series4, series5, series6];
        list = listHelper.shuffle(list);
        const result1 = series1.getAllRelations(list);
        const result2 = series3.getAllRelations(list);
        const result3 = series4.getAllRelations(list);

        expect(result1.length).toBe(5);
        expect(result2.length).toBe(5);
        expect(result3.length).toBe(5);

        expect(listHelper.isSeriesInList(result1, series1)).toBe(false);
        expect(listHelper.isSeriesInList(result2, series2)).toBe(true);
        expect(listHelper.isSeriesInList(result3, series6)).toBe(true);


        expect(listHelper.isSeriesInList(result1, series2)).toBe(true);
        expect(listHelper.isSeriesInList(result2, series2)).toBe(true);
        expect(listHelper.isSeriesInList(result3, series2)).toBe(true);
    });
});
