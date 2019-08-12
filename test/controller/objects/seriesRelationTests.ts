import listHelper from "../../../src/backend/helpFunctions/listHelper";

import assert from "assert";

import { ListProviderLocalData } from "../../../src/backend/controller/objects/listProviderLocalData";
import Series from "../../../src/backend/controller/objects/series";
import Name from "../../../src/backend/controller/objects/meta/name";
import ProviderList from "../../../src/backend/controller/provider-list";
import TestProvider from "./testClass/testProvider";

describe('seriesTest | Relations', () => {

    before(() => {
        const testprovider = new TestProvider("Test");
        testprovider.hasUniqueIdForSeasons = false;
        ProviderList.listProviderList.push(testprovider);
    })

    it('get all Relations based on prequel id', async () => {
        const anime1 = getFilledAnime();
        anime1.getListProvidersInfos()[0].id = 1;
        const anime2 = getFilledAnime();
        anime2.getListProvidersInfos()[0].id = 2;
        anime2.getListProvidersInfos()[0].prequelId = 1;
        const anime3 = getFilledAnime();
        anime3.getListProvidersInfos()[0].id = 3;
        anime3.getListProvidersInfos()[0].prequelId = 2;
        const anime4 = getFilledAnime();
        anime4.getListProvidersInfos()[0].id = 4;

        let list = [anime1, anime2, anime3, anime4];
        list = await listHelper.shuffle(list);
        const result1 = await anime1.getAllRelations(list);
        const result2 = await anime2.getAllRelations(list);
        const result3 = await anime3.getAllRelations(list);

        assert.equal(result1.length, 2);
        assert.equal(result2.length, 2);
        assert.equal(result3.length, 2);

        assert.equal(await listHelper.isSeriesInList(result1, anime1), false);
        assert.equal(await listHelper.isSeriesInList(result2, anime2), false);
        assert.equal(await listHelper.isSeriesInList(result3, anime3), false);


        assert.equal(await listHelper.isSeriesInList(result1, anime4), false);
        assert.equal(await listHelper.isSeriesInList(result2, anime4), false);
        assert.equal(await listHelper.isSeriesInList(result3, anime4), false);
    })

    it('get all Relations based on sequel id', async () => {
        const anime1 = getFilledAnime();
        anime1.getListProvidersInfos()[0].id = 1;
        anime1.getListProvidersInfos()[0].sequelId = 2;
        const anime2 = getFilledAnime();
        anime2.getListProvidersInfos()[0].id = 2;
        anime2.getListProvidersInfos()[0].sequelId = 3;
        const anime3 = getFilledAnime();
        anime3.getListProvidersInfos()[0].id = 3;
        const anime4 = getFilledAnime();
        anime4.getListProvidersInfos()[0].id = 4;

        let list = [anime1, anime2, anime3, anime4];
        list = await listHelper.shuffle(list);
        const result1 = await anime1.getAllRelations(list);
        const result2 = await anime2.getAllRelations(list);
        const result3 = await anime3.getAllRelations(list);

        assert.equal(result1.length, 2);
        assert.equal(result2.length, 2);
        assert.equal(result3.length, 2);

        assert.equal(await listHelper.isSeriesInList(result1, anime1), false);
        assert.equal(await listHelper.isSeriesInList(result2, anime2), false);
        assert.equal(await listHelper.isSeriesInList(result3, anime3), false);


        assert.equal(await listHelper.isSeriesInList(result1, anime4), false);
        assert.equal(await listHelper.isSeriesInList(result2, anime4), false);
        assert.equal(await listHelper.isSeriesInList(result3, anime4), false);
    })

    it('get all Relations based on sequel id and prequel id', async () => {
        const anime1 = getFilledAnime();
        anime1.getListProvidersInfos()[0].id = 1;
        anime1.getListProvidersInfos()[0].sequelId = 2;
        const anime2 = getFilledAnime();
        anime2.getListProvidersInfos()[0].id = 2;
        anime2.getListProvidersInfos()[0].sequelId = 3;
        anime2.getListProvidersInfos()[0].prequelId = 1;
        const anime3 = getFilledAnime();
        anime3.getListProvidersInfos()[0].id = 3;
        anime2.getListProvidersInfos()[0].prequelId = 2;
        const anime4 = getFilledAnime();
        anime4.getListProvidersInfos()[0].id = 4;

        let list = [anime1, anime2, anime3, anime4];
        list = await listHelper.shuffle(list);
        const result1 = await anime1.getAllRelations(list);
        const result2 = await anime2.getAllRelations(list);
        const result3 = await anime3.getAllRelations(list);

        assert.equal(result1.length, 2);
        assert.equal(result2.length, 2);
        assert.equal(result3.length, 2);

        assert.equal(await listHelper.isSeriesInList(result1, anime1), false);
        assert.equal(await listHelper.isSeriesInList(result2, anime2), false);
        assert.equal(await listHelper.isSeriesInList(result3, anime3), false);


        assert.equal(await listHelper.isSeriesInList(result1, anime4), false);
        assert.equal(await listHelper.isSeriesInList(result2, anime4), false);
        assert.equal(await listHelper.isSeriesInList(result3, anime4), false);
    })

    it('get all Relations based on provider id', async () => {
        const anime1 = getFilledAnime();
        anime1.getListProvidersInfos()[0].id = 1;
        anime1.getListProvidersInfos()[0].targetSeason = 1;
        const anime2 = getFilledAnime();
        anime2.getListProvidersInfos()[0].id = 1;
        anime2.getListProvidersInfos()[0].targetSeason = 2;
        const anime3 = getFilledAnime();
        anime3.getListProvidersInfos()[0].id = 1;
        anime3.getListProvidersInfos()[0].targetSeason = 3;
        const anime4 = getFilledAnime();
        anime4.getListProvidersInfos()[0].id = 4;

        let list = [anime1, anime2, anime3, anime4];
        list = await listHelper.shuffle(list);
        const result1 = await anime1.getAllRelations(list);
        const result2 = await anime2.getAllRelations(list);
        const result3 = await anime3.getAllRelations(list);

        assert.equal(result1.length, 2);
        assert.equal(result2.length, 2);
        assert.equal(result3.length, 2);

        assert.equal(await listHelper.isSeriesInList(result1, anime1), false);
        assert.equal(await listHelper.isSeriesInList(result2, anime2), false);
        assert.equal(await listHelper.isSeriesInList(result3, anime3), false);


        assert.equal(await listHelper.isSeriesInList(result1, anime4), false);
        assert.equal(await listHelper.isSeriesInList(result2, anime4), false);
        assert.equal(await listHelper.isSeriesInList(result3, anime4), false);
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
