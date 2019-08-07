
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import ListController from '../../src/backend/controller/listController';
import * as assert from 'assert';
import stringHelper from '../../src/backend/helpFunctions/stringHelper';
import listHelper from '../../src/backend/helpFunctions/listHelper';
import { ListProviderLocalData } from '../../src/backend/controller/objects/listProviderLocalData';
import Series from '../../src/backend/controller/objects/series';
import TestProvider from './objects/testClass/testProvider';
import Name from '../../src/backend/controller/objects/meta/name';
describe('ListControllerTest | Combine', () => {
    var lc = new ListController(false);
    before(() => {
        ListController['listLoaded'] = true;
        lc['saveData'] = () => { }
    })
    beforeEach(() => {
        ListController['mainList'] = [];
    })
    it('should combine same entry', async () => {


        var entry: Series[] = [];
        entry.push(getFilledAnime());
        entry.push(getFilledAnime());
        var a = await lc['addSeriesToMainList'](...entry);
        assert.equal(ListController['mainList'].length, 1);
    });

    it('should combine basic entrys correct', async () => {

        var entry: Series[] = [];
        entry.push(getFilledAnime());
        entry.push(getFilledAnime());
        for (let index = 0; index < 20; index++) {
            entry.push(getRandomeFilledAnime());
        }
        var a = await lc['addSeriesToMainList'](...entry);
        assert.equal(ListController['mainList'].length, 21);
    });

    it('should combine basic entrys with less data', async () => {
        var entry: Series[] = [];
        var x2 = getFilledAnime();
        x2.episodes = undefined;
        x2.releaseYear = undefined;
        entry.push(x2);
        entry.push(getFilledAnime());
        for (let index = 0; index < 20; index++) {
            entry.push(getRandomeFilledAnime());
        }
        var a = await lc['addSeriesToMainList'](...entry);
        assert.equal(ListController['mainList'].length, 21);
        return;
    });

    it('should combine basic entrys with season in title (1/4)', async () => {
        var entry: Series[] = [];
        var x2 = getFilledAnime();
        x2.listProviderInfos[0].targetSeason = undefined;
        x2.names.push(new Name("Test III","en"));
        entry.push(x2);
        entry.push(getFilledAnime());
        for (let index = 0; index < 20; index++) {
            entry.push(getRandomeFilledAnime());
        }
        var a = await lc['addSeriesToMainList'](...entry);
        assert.equal(ListController['mainList'].length, 21);
        return;
    });
    it('should combine basic entrys with season in title (2/4)', async () => {
        var entry: Series[] = [];
        var x2 = getFilledAnime();
        x2.listProviderInfos[0].targetSeason = undefined;
        x2.names.push(new Name("Test 3","en"));
        entry.push(x2);
        entry.push(getFilledAnime());
        for (let index = 0; index < 20; index++) {
            entry.push(getRandomeFilledAnime());
        }
        var a = await lc['addSeriesToMainList'](...entry);
        assert.equal(ListController['mainList'].length, 21);
        return;
    });
    it('should combine basic entrys with season in title (3/4)', async () => {
        var entry: Series[] = [];
        var x2 = getFilledAnime();
        x2.names.push(new Name("Test Season 3","en"));
        x2.releaseYear = 0;
        x2.episodes = 0;
        entry.push(x2);
        entry.push(getFilledAnime());
        for (let index = 0; index < 20; index++) {
            entry.push(getRandomeFilledAnime());
        }
        var a = await lc['addSeriesToMainList'](...entry);
        assert.equal(ListController['mainList'].length, 21);
        return;
    });

    it('should combine basic entrys with season in title (4/4)', async () => {
        var entry: Series[] = [];
        let x = getFilledAnime();
        x.names.push(new Name("Test","en"));
        var x2 = getFilledAnime();
        x2.names.push(new Name("Test x","en"));
        x2.releaseYear = 0;
        x2.episodes = 0;
        entry.push(x2);
        entry.push();
        for (let index = 0; index < 22; index++) {
            entry.push(getRandomeFilledAnime());
        }
        var a = await lc['addSeriesToMainList'](...entry);
        assert.equal(ListController['mainList'].length, 23);
        return;
    });

    it('should combine (4/4)', async () => {
        var entry: Series[] = [];
        let x = getFilledAnime();
        x.releaseYear = 2002;
        x.episodes = 220;
        var x2 = getFilledAnime();

        x2.releaseYear = 2002;
        x2.episodes = 220;
        entry.push(x2);
        entry.push();
        for (let index = 0; index < 22; index++) {
            entry.push(getRandomeFilledAnime());
        }
        var a = await lc['addSeriesToMainList'](...entry);
        assert.equal(ListController['mainList'].length, 23);
        return;
    });

    it('should sort list', async () => {
        var entry: Series[] = [];
        var x2 = getFilledAnime();
        x2.names.push(new Name("A","en"));
        var x3 = getFilledAnime();
        x3.names.push(new Name("B","en"));
        var x4 = getFilledAnime();
        x4.names.push(new Name("C","en"));
        var x5 = getFilledAnime();
        x5.names.push(new Name("D","en"));
        var x6 = getFilledAnime();
        x6.names.push(new Name("E","en"));
        var x7 = getFilledAnime();
        x7.names.push(new Name("F","en"));

        entry.push(x7);
        entry.push(x6);
        entry.push(x5);
        entry.push(x4);
        entry.push(x3);
        entry.push(x2);
        entry = await listHelper.shuffle<Series>(entry);
        entry = await listHelper.sortList(entry);
        assert.equal(entry[0].names, x2.names);
        assert.equal(entry[1].names, x3.names);
        assert.equal(entry[2].names, x4.names);
        return;
    });

    it('should clean doubled entrys (1/2)', async () => {
        var lpld = new ListProviderLocalData();
        lpld.id = 2;
        lpld.episodes = 12;
        lpld.targetSeason = 1;
        var x1 = getFilledAnime();
        x1.listProviderInfos[0].targetSeason = 1;
        x1.listProviderInfos.push(lpld);

        var x2 = getFilledAnime();
        x2.listProviderInfos.push(lpld);
        x2.listProviderInfos[0].targetSeason = 1;

        var x3 = getFilledAnime();
        x3.listProviderInfos.push(lpld);
        x3.listProviderInfos[0].targetSeason = 1;

        await lc.addSeriesToMainList(x1, x2, x3);

        assert.equal(ListController['mainList'].length, 1);
    })
    it('should clean doubled entrys (3/3)', async () => {
        var lpld = new ListProviderLocalData();
        lpld.id = 2;
        lpld.episodes = 12;
        lpld.targetSeason = 1;
        var x1 = getFilledAnime();
        x1.listProviderInfos[0].targetSeason = 1;
        x1.listProviderInfos.push(lpld);
        var x2 = getFilledAnime();
        x2.listProviderInfos.push(lpld);
        x2.listProviderInfos[0].targetSeason = undefined;

        ListController['mainList'] = [x1, x2];

        await lc.addSeriesToMainList(x1, x2);

        assert.equal(ListController['mainList'].length, 1);
    })


    it('shouldnt clean doubled entrys (1/2)', async () => {
        var lpld = new ListProviderLocalData();
        lpld.id = 2;
        lpld.episodes = 12;
        var lpld2 = new ListProviderLocalData();
        lpld2.id = 3;
        lpld2.episodes = 12;

        var x1 = getFilledAnime();
        x1.listProviderInfos[0].targetSeason = 1;
        x1.listProviderInfos.push(lpld);

        var x2 = getFilledAnime();
        x2.listProviderInfos[0].targetSeason = 2;
        x2.listProviderInfos.push(lpld2);

        console.log(x1);
        console.log(x2);

        await lc.addSeriesToMainList(x1, x2);

        assert.equal(ListController['mainList'].length, 2);
    })

    it('shouldnt clean doubled entrys (2/2)', async () => {
        var lpld = new ListProviderLocalData();
        lpld.id = 2;
        lpld.episodes = 12;
        var lpld2 = new ListProviderLocalData();
        lpld2.id = 3;
        lpld2.episodes = 12;

        var x1 = getFilledAnime();
        x1.listProviderInfos[0].targetSeason = undefined;
        x1.listProviderInfos.push(lpld);

        var x2 = getFilledAnime();
        x2.listProviderInfos[0].targetSeason = undefined;
        x2.listProviderInfos.push(lpld2);

        ListController['mainList'] = [x1, x2];

        const x = await lc.addSeriesToMainList(x1, x2);

        assert.equal(ListController['mainList'].length, 2);
    })

    it('should clean doubled entrys (2/2)', async () => {
        var lpld = new ListProviderLocalData();
        lpld.id = 2;
        lpld.episodes = 12;

        var x1 = getFilledAnime();
        x1.listProviderInfos[0].targetSeason = undefined;
        x1.listProviderInfos.push(lpld);

        var x2 = getFilledAnime();
        x2.listProviderInfos[0].targetSeason = undefined;
        x2.listProviderInfos.push(lpld);

        ListController['mainList'] = [x1, x2];

        await lc.addSeriesToMainList(x1, x2);

        assert.equal(ListController['mainList'].length, 1);
    })

    it('should clean doubled entrys (2/3)', async () => {
        var lpld = new ListProviderLocalData();
        lpld.id = 2;
        lpld.episodes = 12;

        var x1 = getFilledAnime();
        x1.listProviderInfos[0].targetSeason = undefined;
        x1.listProviderInfos.push(lpld);


        var x2 = getFilledAnime();
        x2.listProviderInfos[0].targetSeason = 1;
        x2.listProviderInfos.push(lpld);

        ListController['mainList'] = [x1, x2];

        await lc.addSeriesToMainList(x1, x2);

        assert.equal(ListController['mainList'].length, 1);
    })
})

function getFilledAnime(): Series {
    const provider = new ListProviderLocalData();
    var anime = new Series();
    anime.episodes = 10;
    anime.releaseYear = 2014;
    anime.names.push(new Name("Test","en"));
    provider.targetSeason = 3;
    anime.listProviderInfos.push(provider);
    return anime;
}

function getRandomeFilledAnime(): Series {
    const provider = new ListProviderLocalData();
    var anime: Series = new Series();
    anime.episodes = Math.random() * (+13 - +0) + +0;
    anime.releaseYear = Math.random() * (+2019 - +1989) + +1989;

    provider.targetSeason = Math.random() * (+3 - +0) + +0;
    anime.names.push(new Name(stringHelper.randomString(),"en"));
    anime.listProviderInfos.push(provider);
    return anime;
}
