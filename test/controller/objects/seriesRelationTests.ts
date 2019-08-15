import listHelper from "../../../src/backend/helpFunctions/listHelper";

import assert from "assert";

import { ListProviderLocalData } from "../../../src/backend/controller/objects/listProviderLocalData";
import Series from "../../../src/backend/controller/objects/series";
import Name from "../../../src/backend/controller/objects/meta/name";
import ProviderList from "../../../src/backend/controller/provider-list";
import TestProvider from "./testClass/testProvider";
import { MediaType } from "../../../src/backend/controller/objects/meta/mediaType";

describe('seriesTest | Relations', () => {

    before(() => {
        const testprovider = new TestProvider("Test");
        testprovider.hasUniqueIdForSeasons = false;
        ProviderList.listProviderList.push(testprovider);
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
        series1.mediaType = MediaType.SERIES;
        series1.getListProvidersInfos()[0].id = 1;
        series1.getListProvidersInfos()[0].sequelIds.push(2);
        series1.getListProvidersInfos()[0].sequelIds.push(3);
        const series2 = getFilledAnime();
        series2.getListProvidersInfos()[0].id = 2;
        series2.mediaType = MediaType.MOVIE;
        series2.getListProvidersInfos()[0].sequelIds.push(5);
        const series3 = getFilledAnime();
        series3.mediaType = MediaType.SERIES;
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

        assert.equal(result1.length, 2, "Id 1 failed");
        assert.equal(result2.length, 2, "Id 2 failed");
        assert.equal(result3.length, 2, "Id 3 failed");

        assert.equal(await listHelper.isSeriesInList(result1, series1), false);
        assert.equal(await listHelper.isSeriesInList(result2, series2), false);
        assert.equal(await listHelper.isSeriesInList(result3, series6), false);


        assert.equal(await listHelper.isSeriesInList(result1, series2), false);
        assert.equal(await listHelper.isSeriesInList(result2, series2), false);
        assert.equal(await listHelper.isSeriesInList(result3, series2), false);
    })

    function getFilledAnime(): Series {
        const provider = new ListProviderLocalData("Test");
        var anime = new Series();
        anime.episodes = 10;
        anime.releaseYear = 2014;
        anime.addSeriesName(new Name("Test", "en"));
        provider.targetSeason = 3;
        anime.addListProvider(provider);
        return anime;
    }
});
