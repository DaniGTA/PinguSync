import assert from 'assert';

import Name from '../../../src/backend/controller/objects/meta/name';
import Series from '../../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';
import listHelper from '../../../src/backend/helpFunctions/list-helper';
import TestHelper from '../../test-helper';
import TestProvider from './testClass/testProvider';

describe('Series | Relations', () => {

    beforeEach(() => {
        TestHelper.mustHaveBefore();
        const testprovider = new TestProvider('Test');
        testprovider.hasUniqueIdForSeasons = false;
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'] = ProviderList.getListProviderList();
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'].push(testprovider);
    });

    it('get all Relations based on prequel id', async () => {
        const series1 = getFilledAnime(1);
        const series2 = getFilledAnime(2);
        series2.getListProvidersInfos()[0].prequelIds.push(1);
        const series3 = getFilledAnime(3);
        series3.getListProvidersInfos()[0].prequelIds.push(2);
        const series4 = getFilledAnime(4);

        let list = [series1, series2, series3, series4];
        list = await listHelper.shuffle(list);
        const result1 = await series1.getAllRelations(list);
        const result2 = await series2.getAllRelations(list);
        const result3 = await series3.getAllRelations(list);

        assert.equal(result1.length, 2);
        assert.equal(result2.length, 2);
        assert.equal(result3.length, 2);

        assert.equal(await listHelper.isSeriesInList(result1, series1), false);
        assert.equal(await listHelper.isSeriesInList(result2, series2), false);
        assert.equal(await listHelper.isSeriesInList(result3, series3), false);


        assert.equal(await listHelper.isSeriesInList(result1, series4), false);
        assert.equal(await listHelper.isSeriesInList(result2, series4), false);
        assert.equal(await listHelper.isSeriesInList(result3, series4), false);
    });

    it('get all Relations based on sequel id', async () => {
        const series1 = getFilledAnime(1);
        series1.getListProvidersInfos()[0].sequelIds.push(2);
        const series2 = getFilledAnime(2);
        series2.getListProvidersInfos()[0].sequelIds.push(3);
        const series3 = getFilledAnime(3);
        const series4 = getFilledAnime(4);

        let list = [series1, series2, series3, series4];
        list = await listHelper.shuffle(list);
        const result1 = await series1.getAllRelations(list);
        const result2 = await series2.getAllRelations(list);
        const result3 = await series3.getAllRelations(list);

        assert.equal(result1.length, 2);
        assert.equal(result2.length, 2);
        assert.equal(result3.length, 2);

        assert.equal(await listHelper.isSeriesInList(result1, series1), false);
        assert.equal(await listHelper.isSeriesInList(result2, series2), false);
        assert.equal(await listHelper.isSeriesInList(result3, series3), false);


        assert.equal(await listHelper.isSeriesInList(result1, series4), false);
        assert.equal(await listHelper.isSeriesInList(result2, series4), false);
        assert.equal(await listHelper.isSeriesInList(result3, series4), false);
    });

    it('get all Relations based on sequel id and prequel id', async () => {
        const series1 = getFilledAnime(1);
        series1.getListProvidersInfos()[0].sequelIds.push(2);
        const series2 = getFilledAnime(2);
        series2.getListProvidersInfos()[0].sequelIds.push(3);
        series2.getListProvidersInfos()[0].prequelIds.push(1);
        const series3 = getFilledAnime(3);
        series2.getListProvidersInfos()[0].prequelIds.push(2);
        const series4 = getFilledAnime(4);

        let list = [series1, series2, series3, series4];
        list = await listHelper.shuffle(list);
        const result1 = await series1.getAllRelations(list);
        const result2 = await series2.getAllRelations(list);
        const result3 = await series3.getAllRelations(list);

        assert.equal(result1.length, 2);
        assert.equal(result2.length, 2);
        assert.equal(result3.length, 2);

        assert.equal(await listHelper.isSeriesInList(result1, series1), false);
        assert.equal(await listHelper.isSeriesInList(result2, series2), false);
        assert.equal(await listHelper.isSeriesInList(result3, series3), false);

        assert.equal(await listHelper.isSeriesInList(result1, series4), false);
        assert.equal(await listHelper.isSeriesInList(result2, series4), false);
        assert.equal(await listHelper.isSeriesInList(result3, series4), false);
    });

    it('get all Relations based on provider id', async () => {
        const series1 = getFilledAnime(1);
        series1.getListProvidersInfos()[0].targetSeason = 1;
        const series2 = getFilledAnime(1);
        series2.getListProvidersInfos()[0].targetSeason = 2;
        const series3 = getFilledAnime(1);
        series3.getListProvidersInfos()[0].targetSeason = 3;
        const series4 = getFilledAnime(4);

        let list = [series1, series2, series3, series4];
        list = await listHelper.shuffle(list);
        const result1 = await series1.getAllRelations(list);
        const result2 = await series2.getAllRelations(list);
        const result3 = await series3.getAllRelations(list);

        assert.equal(result1.length, 2);
        assert.equal(result2.length, 2);
        assert.equal(result3.length, 2);

        assert.equal(await listHelper.isSeriesInList(result1, series1), false);
        assert.equal(await listHelper.isSeriesInList(result2, series2), false);
        assert.equal(await listHelper.isSeriesInList(result3, series3), false);

        assert.equal(await listHelper.isSeriesInList(result1, series4), false);
        assert.equal(await listHelper.isSeriesInList(result2, series4), false);
        assert.equal(await listHelper.isSeriesInList(result3, series4), false);
    });

    it('get all Relations based on multi sequels id', async () => {
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
        list = await listHelper.shuffle(list);
        const result1 = await series1.getAllRelations(list);
        const result2 = await series3.getAllRelations(list);
        const result3 = await series4.getAllRelations(list);

        assert.equal(result1.length, 5, 'Id 1 failed');
        assert.equal(result2.length, 5, 'Id 2 failed');
        assert.equal(result3.length, 5, 'Id 3 failed');

        assert.equal(await listHelper.isSeriesInList(result1, series1), false, 'Series1 shouldnt not be in the own relation list');
        assert.equal(await listHelper.isSeriesInList(result2, series2), true, 'Series3 should have Series2 as relation');
        assert.equal(await listHelper.isSeriesInList(result3, series6), true, 'Series4 should have Series6 as relation');


        assert.equal(await listHelper.isSeriesInList(result1, series2), true, 'Series2 should be in result1');
        assert.equal(await listHelper.isSeriesInList(result2, series2), true, 'Series2 should be in result2');
        assert.equal(await listHelper.isSeriesInList(result3, series2), true, 'Series2 should be in result3');
    });

    function getFilledAnime(id: string | number = 1): Series {
        const provider = new ListProviderLocalData(id, 'Test');
        const anime = new Series();
        provider.addSeriesName(new Name('Test', 'en'));
        provider.targetSeason = 3;
        // tslint:disable-next-line: no-string-literal
        provider['episodes'] = 10;
        provider.releaseYear = 2014;
        anime.addListProvider(provider);
        return anime;
    }
});
