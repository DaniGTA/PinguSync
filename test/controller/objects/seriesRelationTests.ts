import assert from "assert";
import Series from "../../../src/backend/controller/objects/series";
import Name from "../../../src/backend/controller/objects/meta/name";
import ProviderList from "../../../src/backend/controller/provider-manager/provider-list";
import TestProvider from "./testClass/testProvider";
import { MediaType } from "../../../src/backend/controller/objects/meta/media-type";
import { ListProviderLocalData } from "../../../src/backend/controller/objects/list-provider-local-data";
import listHelper from "../../../src/backend/helpFunctions/list-helper";

describe('seriesTest | Relations', () => {

    before(() => {
        const testprovider = new TestProvider("Test");
        testprovider.hasUniqueIdForSeasons = false;
        ProviderList['loadedListProvider'] = ProviderList.getListProviderList();
        ProviderList['loadedListProvider'].push(testprovider);
    })

    it('get all Relations based on prequel id', async () => {
        const series1 = getFilledAnime();
        series1.getListProvidersInfos()[0].id = 1;
        const series2 = getFilledAnime();
        series2.getListProvidersInfos()[0].id = 2;
        series2.getListProvidersInfos()[0].prequelIds.push(1);
        const series3 = getFilledAnime();
        series3.getListProvidersInfos()[0].id = 3;
        series3.getListProvidersInfos()[0].prequelIds.push(2);
        const series4 = getFilledAnime();
        series4.getListProvidersInfos()[0].id = 4;

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
    })

    it('get all Relations based on sequel id', async () => {
        const series1 = getFilledAnime();
        series1.getListProvidersInfos()[0].id = 1;
        series1.getListProvidersInfos()[0].sequelIds.push(2);
        const series2 = getFilledAnime();
        series2.getListProvidersInfos()[0].id = 2;
        series2.getListProvidersInfos()[0].sequelIds.push(3);
        const series3 = getFilledAnime();
        series3.getListProvidersInfos()[0].id = 3;
        const series4 = getFilledAnime();
        series4.getListProvidersInfos()[0].id = 4;

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
    })

    it('get all Relations based on sequel id and prequel id', async () => {
        const series1 = getFilledAnime();
        series1.getListProvidersInfos()[0].id = 1;
        series1.getListProvidersInfos()[0].sequelIds.push(2);
        const series2 = getFilledAnime();
        series2.getListProvidersInfos()[0].id = 2;
        series2.getListProvidersInfos()[0].sequelIds.push(3);
        series2.getListProvidersInfos()[0].prequelIds.push(1);
        const series3 = getFilledAnime();
        series3.getListProvidersInfos()[0].id = 3;
        series2.getListProvidersInfos()[0].prequelIds.push(2);
        const series4 = getFilledAnime();
        series4.getListProvidersInfos()[0].id = 4;

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
    })

    it('get all Relations based on provider id', async () => {
        const series1 = getFilledAnime();
        series1.getListProvidersInfos()[0].id = 1;
        series1.getListProvidersInfos()[0].targetSeason = 1;
        const series2 = getFilledAnime();
        series2.getListProvidersInfos()[0].id = 1;
        series2.getListProvidersInfos()[0].targetSeason = 2;
        const series3 = getFilledAnime();
        series3.getListProvidersInfos()[0].id = 1;
        series3.getListProvidersInfos()[0].targetSeason = 3;
        const series4 = getFilledAnime();
        series4.getListProvidersInfos()[0].id = 4;

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
    })

    it('get all Relations based on multi sequels id', async () => {
        const series1 = getFilledAnime();
        series1.getListProvidersInfos()[0].id = 1;
        series1.getListProvidersInfos()[0].sequelIds.push(2);
        series1.getListProvidersInfos()[0].sequelIds.push(3);
        const series2 = getFilledAnime();
        series2.getListProvidersInfos()[0].id = 2;
        series2.getListProvidersInfos()[0].sequelIds.push(5);
        const series3 = getFilledAnime();
        series3.getListProvidersInfos()[0].id = 3;
        series3.getListProvidersInfos()[0].sequelIds.push(4);
        series3.getListProvidersInfos()[0].prequelIds.push(1);
        const series4 = getFilledAnime();
        series4.getListProvidersInfos()[0].prequelIds.push(3);
        series4.getListProvidersInfos()[0].id = 4;
        const series5 = getFilledAnime();
        series5.getListProvidersInfos()[0].id = 5;
        series5.getListProvidersInfos()[0].sequelIds.push(6);
        series5.getListProvidersInfos()[0].prequelIds.push(2);
        const series6 = getFilledAnime();
        series6.getListProvidersInfos()[0].id = 6;

        let list = [series1, series2, series3, series4, series5, series6];
        list = await listHelper.shuffle(list);
        const result1 = await series1.getAllRelations(list);
        const result2 = await series3.getAllRelations(list);
        const result3 = await series4.getAllRelations(list);

        assert.equal(result1.length, 5, "Id 1 failed");
        assert.equal(result2.length, 5, "Id 2 failed");
        assert.equal(result3.length, 5, "Id 3 failed");

        assert.equal(await listHelper.isSeriesInList(result1, series1), false, "Series1 shouldnt not be in the own relation list");
        assert.equal(await listHelper.isSeriesInList(result2, series2), true, "Series3 should have Series2 as relation");
        assert.equal(await listHelper.isSeriesInList(result3, series6), true, "Series4 should have Series6 as relation");


        assert.equal(await listHelper.isSeriesInList(result1, series2), true, "Series2 should be in result1");
        assert.equal(await listHelper.isSeriesInList(result2, series2), true, "Series2 should be in result2");
        assert.equal(await listHelper.isSeriesInList(result3, series2), true, "Series2 should be in result3");
    })

    function getFilledAnime(): Series {
        const provider = new ListProviderLocalData("Test");
        var anime = new Series();
        provider.addSeriesName(new Name("Test", "en"));
        provider.targetSeason = 3;
        provider['episodes'] = 10;
        provider.releaseYear = 2014;
        anime.addListProvider(provider);
        return anime;
    }
});
