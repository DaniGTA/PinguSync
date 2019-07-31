
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import ListController from '../../src/backend/controller/listController';
import * as assert from 'assert';
import stringHelper from '../../src/backend/helpFunctions/stringHelper';
import listHelper from '../../src/backend/helpFunctions/listHelper';
import { ListProviderLocalData } from '../../src/backend/controller/objects/listProviderLocalData';
import Series from '../../src/backend/controller/objects/series';
describe('ListControllerTest | Combine', () => {
    it('should combine same entry', async () => {
        var lc = new ListController();
        var entry: Series[] = [];
        entry.push(getFilledAnime());
        entry.push(getFilledAnime());
        var a = await lc['combineDoubleEntrys'](entry);
        assert.equal(a.length, 1);
    });

    it('should combine basic entrys correct', async () => {
        var lc = new ListController();
        var entry: Series[] = [];
        entry.push(getFilledAnime());
        entry.push(getFilledAnime());
        for (let index = 0; index < 20; index++) {
            entry.push(getRandomeFilledAnime());
        }
        var a = await lc['combineDoubleEntrys'](entry);
        assert.equal(a.length, 21);
    });

    it('should combine basic entrys with less data', async () => {
        var lc = new ListController();
        var entry: Series[] = [];
        var x2 = getFilledAnime();
        x2.episodes = undefined;
        x2.releaseYear = undefined;
        entry.push(x2);
        entry.push(getFilledAnime());
        for (let index = 0; index < 20; index++) {
            entry.push(getRandomeFilledAnime());
        }
        var a = await lc['combineDoubleEntrys'](entry);
        assert.equal(a.length, 21);
        return;
    });

    it('should combine basic entrys with season in title (1/4)', async () => {
        var lc = new ListController();
        var entry: Series[] = [];
        var x2 = getFilledAnime();
        x2.seasonNumber = undefined;
        x2.names.engName = "Test III";
        entry.push(x2);
        entry.push(getFilledAnime());
        for (let index = 0; index < 20; index++) {
            entry.push(getRandomeFilledAnime());
        }
        var a = await lc['combineDoubleEntrys'](entry);
        assert.equal(a.length, 21);
        return;
    });
    it('should combine basic entrys with season in title (2/4)', async () => {
        var lc = new ListController();
        var entry: Series[] = [];
        var x2 = getFilledAnime();
        x2.seasonNumber = undefined;
        x2.names.engName = "Test 3";
        entry.push(x2);
        entry.push(getFilledAnime());
        for (let index = 0; index < 20; index++) {
            entry.push(getRandomeFilledAnime());
        }
        var a = await lc['combineDoubleEntrys'](entry);
        assert.equal(a.length, 21);
        return;
    });
    it('should combine basic entrys with season in title (3/4)', async () => {
        var lc = new ListController();
        var entry: Series[] = [];
        var x2 = getFilledAnime();
        x2.names.engName = "Test Season 3";
        x2.releaseYear = 0;
        x2.episodes = 0;
        entry.push(x2);
        entry.push(getFilledAnime());
        for (let index = 0; index < 20; index++) {
            entry.push(getRandomeFilledAnime());
        }
        var a = await lc['combineDoubleEntrys'](entry);
        assert.equal(a.length, 21);
        return;
    });

    it('should combine basic entrys with season in title (4/4)', async () => {
        var lc = new ListController();
        var entry: Series[] = [];
        let x = getFilledAnime();
        x.seasonNumber = undefined;
        x.names.engName = "Tesjo"
        var x2 = getFilledAnime();
        x2.names.engName = "Tesjo x";
        x2.releaseYear = 0;
        x2.episodes = 0;
        entry.push(x2);
        entry.push();
        for (let index = 0; index < 22; index++) {
            entry.push(getRandomeFilledAnime());
        }
        var a = await lc['combineDoubleEntrys'](entry);
        assert.equal(a.length, 23);
        return;
    });
    it('should sort list', async () => {

        var lc = new ListController();

        var entry: Series[] = [];
        var x2 = getFilledAnime();
        x2.names.engName = 'A';
        var x3 = getFilledAnime();
        x3.names.engName = 'B';
        var x4 = getFilledAnime();
        x4.names.engName = 'C';
        var x5 = getFilledAnime();
        x5.names.engName = 'D';
        var x6 = getFilledAnime();
        x6.names.engName = 'X';
        var x7 = getFilledAnime();
        x7.names.engName = 'F';

        entry.push(x7);
        entry.push(x6);
        entry.push(x5);
        entry.push(x4);
        entry.push(x3);
        entry.push(x2);
        entry = await listHelper.shuffle<Series>(entry);
        entry = await listHelper.sortList(entry);
        assert.equal(entry[0].names.engName, x2.names.engName);
        assert.equal(entry[1].names.engName, x3.names.engName);
        assert.equal(entry[2].names.engName, x4.names.engName);
        return;
    });

    it('should clean doubled entrys (1/2)', async () => {
        var lc = new ListController();
        ListController['mainList'] = [];

        var lpld = new ListProviderLocalData();
        lpld.id = 2;
        lpld.episodes = 12;
        lpld.targetSeason = 1;
        var x1 = getFilledAnime();
        x1.seasonNumber = 1;
        x1.listProviderInfos.push(lpld);
        var x2 = getFilledAnime();
        x2.seasonNumber = 1;
        x2.listProviderInfos.push(lpld);
        x2.listProviderInfos[0].targetSeason = 2;
        var x3 = getFilledAnime();
        x3.seasonNumber = 1;
        x3.listProviderInfos.push(lpld);
        x2.listProviderInfos[0].targetSeason = 3;

        ListController['mainList'] = [x1, x2, x3];

        await lc.cleanBadDataFromMainList();

        assert.equal(ListController['mainList'].length, 1);
    })


    it('shouldnt clean doubled entrys (1/2)', async () => {
        var lc = new ListController();
        ListController['mainList'] = [];

        var lpld = new ListProviderLocalData();
        lpld.id = 2;
        lpld.episodes = 12;

        var x1 = getFilledAnime();
        x1.seasonNumber = 1;
        x1.listProviderInfos.push(lpld);

        var x2 = getFilledAnime();
        x2.seasonNumber = 2;
        x2.listProviderInfos.push(lpld);

        ListController['mainList'] = [x1, x2];

        await lc.cleanBadDataFromMainList();

        assert.equal(ListController['mainList'].length, 2);
    })

    it('shouldnt clean doubled entrys (2/2)', async () => {
        var lc = new ListController();
        ListController['mainList'] = [];

        var lpld = new ListProviderLocalData();
        lpld.id = 2;
        lpld.episodes = 12;

        var x1 = getFilledAnime();
        x1.seasonNumber = undefined;
        x1.listProviderInfos.push(lpld);

        var x2 = getFilledAnime();
        x2.seasonNumber = undefined;
        lpld.id = 3;
        x2.listProviderInfos.push(lpld);

        ListController['mainList'] = [x1, x2];

        const x = await lc.cleanBadDataFromMainList();

        assert.equal(ListController['mainList'].length, 2);
    })

    it('should clean doubled entrys (2/2)', async () => {
        var lc = new ListController();
        ListController['mainList'] = [];

        var lpld = new ListProviderLocalData();
        lpld.id = 2;
        lpld.episodes = 12;

        var x1 = getFilledAnime();
        x1.seasonNumber = undefined;
        x1.listProviderInfos.push(lpld);

        var x2 = getFilledAnime();
        x2.seasonNumber = undefined;
        x2.listProviderInfos.push(lpld);

        ListController['mainList'] = [x1, x2];

        await lc.cleanBadDataFromMainList();

        assert.equal(ListController['mainList'].length, 1);
    })

    it('should clean doubled entrys (2/3)', async () => {
        var lc = new ListController();
        ListController['mainList'] = [];

        var lpld = new ListProviderLocalData();
        lpld.id = 2;
        lpld.episodes = 12;

        var x1 = getFilledAnime();
        x1.seasonNumber = undefined;
        x1.listProviderInfos.push(lpld);

        var x2 = getFilledAnime();
        x2.seasonNumber = 1;
        x2.listProviderInfos.push(lpld);

        ListController['mainList'] = [x1, x2];

        await lc.cleanBadDataFromMainList();

        assert.equal(ListController['mainList'].length, 1);
    })
})

function getFilledAnime(): Series {
    var anime = new Series();
    anime.episodes = 10;
    anime.releaseYear = 2014;
    anime.seasonNumber = 3;
    anime.names.engName = "Test";
    return anime;
}

function getRandomeFilledAnime(): Series {
    var anime: Series = new Series();
    anime.episodes = Math.random() * (+13 - +0) + +0;
    anime.releaseYear = Math.random() * (+2019 - +1989) + +1989;
    anime.seasonNumber = Math.random() * (+3 - +0) + +0;
    anime.names.engName = stringHelper.randomString();
    return anime;
}
