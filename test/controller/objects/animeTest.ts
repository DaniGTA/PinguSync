import * as assert from 'assert';
import Anime from '../../../src/backend/controller/objects/anime';
import { ProviderInfo } from '../../../src/backend/controller/objects/providerInfo';

describe('animeTest', () => {
    it('should have a id', async () => {
        const anime = new Anime();
        assert.notEqual(anime.id.length, 0);
        return;
    });

    it('should return season (1/3)', async () => {
        const anime = new Anime();
        anime.seasonNumber = 1;
        assert.equal(await anime.getSeason(), 1);
        return;
    });

    it('should return season (2/3)', async () => {
        const anime = new Anime();
        anime.names.engName = 'Test 3';

        assert.equal(await anime.getSeason(), 3);
        return;
    });

    it('should return season (3/3)', async () => {
        const anime = new Anime();
        anime.names.engName = 'Test III';

        assert.equal(await anime.getSeason(), 3);
        return;
    });

    it('should return last provider', async () => {
        const anime = new Anime();
        const providerA = new ProviderInfo();
        const providerB = new ProviderInfo();
        anime.providerInfos = [];
        anime.providerInfos.push(providerA, providerB);
        assert.equal(await anime.internalTests().getLastUpdatedProvider(), providerA);
        return;
    });

    it('should return last watchprogress', async () => {
        const anime = new Anime();
        const providerA = new ProviderInfo();
        providerA.watchProgress = 5;
        const providerB = new ProviderInfo();
        providerB.watchProgress = 4;
        anime.providerInfos = [];
        anime.providerInfos.push(providerA, providerB);
        assert.equal(await anime.getLastWatchProgress(), 5);
        return;
    });
});
