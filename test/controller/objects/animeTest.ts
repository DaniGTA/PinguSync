import * as assert from 'assert';
import ProviderList from '../../../src/backend/controller/providerList';
import TestProvider from './testClass/testProvider';
import { ListProviderLocalData } from '../../../src/backend/controller/objects/listProviderLocalData';
import listHelper from '../../../src/backend/helpFunctions/listHelper';
import Series from '../../../src/backend/controller/objects/series';

describe('animeTest', () => {
    it('should have a id', async () => {
        const anime = new Series();
        assert.notEqual(anime.id.length, 0);
        return;
    });

    it('should return season (1/3)', async () => {
        const anime = new Series();
        anime.seasonNumber = 1;
        assert.equal(await anime.getSeason(), 1);
        return;
    });

    it('should return season (2/3)', async () => {
        const anime = new Series();
        anime.names.engName = 'Test 3';

        assert.equal(await anime.getSeason(), 3);
        return;
    });

    it('should return season (3/3)', async () => {
        const anime = new Series();
        anime.names.engName = 'Test III';

        assert.equal(await anime.getSeason(), 3);
        return;
    });

    it('should return last provider', async () => {
        const anime = new Series();
        const providerA = new ListProviderLocalData();
        providerA.lastUpdate = new Date(100);
        providerA.watchProgress = [];
        const providerB = new ListProviderLocalData();
        providerB.watchProgress = [];
        providerB.lastUpdate = new Date(50);
        anime.listProviderInfos.push(providerA, providerB);
        assert.equal(await anime['getLastUpdatedProvider'](), providerA);
        return;
    });

    it('should return last watchprogress', async () => {
        const anime = new Series();
        const providerA = new ListProviderLocalData();
        providerA.lastUpdate = new Date(2);
        providerA.addOneEpisode(5);
        const providerB = new ListProviderLocalData();
        providerB.lastUpdate = new Date(1);
        providerB.addOneEpisode(4);
        anime.listProviderInfos.push(providerA, providerB);
        const result = await anime.getLastWatchProgress()
        if (typeof result != 'undefined') {
            assert.equal(result.episode, 5);
        }
        assert.notEqual(typeof result, 'undefined');
        return;
    });

    it('should all episodes (1/3)', async () => {
        const anime = new Series();
        const providerA = new ListProviderLocalData();
        providerA.episodes = 10;
        const providerB = new ListProviderLocalData();
        providerB.episodes = 11;
        anime.listProviderInfos.push(providerA, providerB);
        const allEpisodes = await anime.getAllEpisodes();
        assert.deepStrictEqual(allEpisodes, [10, 11]);
        return;
    });

    it('should all episodes (2/3)', async () => {
        const anime = new Series();
        const providerA = new ListProviderLocalData();
        providerA.episodes = 10;
        const providerB = new ListProviderLocalData();
        anime.episodes = 11;
        anime.listProviderInfos.push(providerA, providerB);
        assert.deepStrictEqual(await anime.getAllEpisodes(), [10, 11]);
        return;
    });

    it('should all episodes (3/3)', async () => {
        const anime = new Series();
        const providerA = new ListProviderLocalData();

        anime.listProviderInfos.push(providerA);
        assert.deepStrictEqual(await anime.getAllEpisodes(), []);
        return;
    });

    it('should max episode (1/3)', async () => {
        const anime = new Series();
        const providerA = new ListProviderLocalData();
        providerA.episodes = 12;
        const providerB = new ListProviderLocalData();
        anime.episodes = 11;
        anime.listProviderInfos.push(providerA, providerB);
        assert.equal(anime.getMaxEpisode(), 12);
        return;
    });

    it('should max episode (2/3)', async () => {
        const anime = new Series();
        const providerA = new ListProviderLocalData();
        providerA.episodes = 12;
        const providerB = new ListProviderLocalData();
        providerB.episodes = 24;
        anime.episodes = 11;
        anime.listProviderInfos.push(providerA, providerB);
        assert.strictEqual(anime.getMaxEpisode(), 24);
        return;
    });

    it('should max episode (3/3)', async () => {
        const anime = new Series();
        const providerA = new ListProviderLocalData();
        providerA.episodes = 12;
        const providerB = new ListProviderLocalData();
        providerB.episodes = 24;
        anime.episodes = 11;
        anime.listProviderInfos.push(providerA, providerB);
        assert.throws(anime.getMaxEpisode);
        return;
    });
});
