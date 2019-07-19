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
        providerA.watchProgress = [];
        const providerB = new ProviderInfo();
        providerB.watchProgress = [];
        anime.providerInfos.push(providerA, providerB);
        assert.equal(await anime['getLastUpdatedProvider'](), providerA);
        return;
    });

    it('should return last watchprogress', async () => {
        const anime = new Anime();
        const providerA = new ProviderInfo();
        providerA.addOneEpisode(5);
        const providerB = new ProviderInfo();
        providerB.addOneEpisode(4);
        anime.providerInfos.push(providerA, providerB);
        const result = await anime.getLastWatchProgress()
        if (typeof result != 'undefined') {
            assert.equal(result.episode, 5);
        }
        assert.notEqual(typeof result, 'undefined');
        return;
    });

    it('should all episodes (1/3)', async () => {
        const anime = new Anime();
        const providerA = new ProviderInfo();
        providerA.episodes = 10;
        const providerB = new ProviderInfo();
        providerB.episodes = 11;
        anime.providerInfos.push(providerA, providerB);
        const allEpisodes = await anime.getAllEpisodes();
        assert.deepStrictEqual(allEpisodes, [10, 11]);
        return;
    });

    it('should all episodes (2/3)', async () => {
        const anime = new Anime();
        const providerA = new ProviderInfo();
        providerA.episodes = 10;
        const providerB = new ProviderInfo();
        anime.episodes = 11;
        anime.providerInfos.push(providerA, providerB);
        assert.deepStrictEqual(await anime.getAllEpisodes(), [10, 11]);
        return;
    });

    it('should all episodes (3/3)', async () => {
        const anime = new Anime();
        const providerA = new ProviderInfo();

        anime.providerInfos.push(providerA);
        assert.deepStrictEqual(await anime.getAllEpisodes(), []);
        return;
    });

    it('should max episode (1/3)', async () => {
        const anime = new Anime();
        const providerA = new ProviderInfo();
        providerA.episodes = 12;
        const providerB = new ProviderInfo();
        anime.episodes = 11;
        anime.providerInfos.push(providerA, providerB);
        assert.equal(anime.getMaxEpisode(), 12);
        return;
    });

    it('should max episode (2/3)', async () => {
        const anime = new Anime();
        const providerA = new ProviderInfo();
        providerA.episodes = 12;
        const providerB = new ProviderInfo();
        providerA.episodes = 24;
        anime.episodes = 11;
        anime.providerInfos.push(providerA, providerB);
        assert.strictEqual(anime.getMaxEpisode(), 24);
        return;
    });

    it('should max episode (3/3)', async () => {
        const anime = new Anime();
        const providerA = new ProviderInfo();
        providerA.episodes = 12;
        const providerB = new ProviderInfo();
        providerA.episodes = 24;
        anime.episodes = 11;
        anime.providerInfos.push(providerA, providerB);
        assert.throws(anime.getMaxEpisode);
        return;
    });
});
