
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import ListController from '../src/backend/controller/listController';
import Anime from '../src/backend/controller/objects/anime';
import * as assert from 'assert';
import stringHelper from '../src/backend/helpFunctions/stringHelper';
describe('CombineEntrys', () => {
    it('should combine basic entrys correct', async () => {

        var lc = new ListController();
        var entry: Anime[] = [];
        entry.push(getFilledAnime());
        entry.push(getFilledAnime());
        for (let index = 0; index < 20; index++) {
            entry.push(getRandomeFilledAnime());
        }
        var a = await lc.InternalTesting().combineDoubleEntrys(entry);
        assert.equal(a.length, 20);
        return;
    });
    it('should combine basic entrys with less data', async () => {
        var lc = new ListController();
        var entry: Anime[] = [];
        var x2 = getFilledAnime();
        x2.episodes = 0;
        x2.releaseYear = 0;
        entry.push(x2);
        entry.push(getFilledAnime());
        for (let index = 0; index < 20; index++) {
            entry.push(getRandomeFilledAnime());
        }
        var a = await lc.InternalTesting().combineDoubleEntrys(entry);
        assert.equal(a.length, 20);
        return;
    });
    it('should combine basic entrys with season in title (1/3)', async () => {
        var lc = new ListController();
        var entry: Anime[] = [];
        var x2 = getFilledAnime();
        x2.seasonNumber = 0;
        x2.names.engName = "Test III";
        entry.push(x2);
        entry.push(getFilledAnime());
        for (let index = 0; index < 20; index++) {
            entry.push(getRandomeFilledAnime());
        }
        var a = await lc.InternalTesting().combineDoubleEntrys(entry);
        assert.equal(a.length, 20);
        return;
    });
    it('should combine basic entrys with season in title (2/3)', async () => {
        var lc = new ListController();
        var entry: Anime[] = [];
        var x2 = getFilledAnime();
        x2.seasonNumber = 0;
        x2.names.engName = "Test 3";
        entry.push(x2);
        entry.push(getFilledAnime());
        for (let index = 0; index < 20; index++) {
            entry.push(getRandomeFilledAnime());
        }
        var a = await lc.InternalTesting().combineDoubleEntrys(entry);
        assert.equal(a.length, 20);
        return;
    });
    it('should combine basic entrys with season in title (3/3)', async () => {
        var lc = new ListController();
        var entry: Anime[] = [];
        var x2 = getFilledAnime();
        x2.names.engName = "Test 3";
        x2.releaseYear = 0;
        x2.episodes = 0;
        entry.push(x2);
        entry.push(getFilledAnime());
        for (let index = 0; index < 20; index++) {
            entry.push(getRandomeFilledAnime());
        }
        var a = await lc.InternalTesting().combineDoubleEntrys(entry);
        assert.equal(a.length, 20);
        return;
    });
});

function getFilledAnime(): Anime {
    var anime = new Anime();
    anime.episodes = 10;
    anime.releaseYear = 2014;
    anime.seasonNumber = 3;
    anime.names.engName = "Test";
    return anime;
}

function getRandomeFilledAnime(): Anime {
    var anime = new Anime();
    anime.episodes = Math.random() * (+13 - +0) + +0;
    anime.releaseYear = Math.random() * (+2019 - +1989) + +1989;
    anime.seasonNumber = Math.random() * (+3 - +0) + +0;
    anime.names.engName = stringHelper.randomString();
    return anime;
}