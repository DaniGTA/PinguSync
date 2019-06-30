import * as assert from 'assert';
import Anime from '../../../src/backend/controller/objects/anime';

describe('animeTest', () => {
    it('should have a id', async () => {
        const anime = new Anime();
        assert.notEqual(anime.id.length, 0);
        return;
    });
    it('should return season', async () => {
        const anime = new Anime();
        anime.seasonNumber = 1;
        assert.equal(await anime.getSeason(), 1);
        return;
    });
});