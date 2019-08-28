import * as assert from 'assert';
import Series from '../../../src/backend/controller/objects/series';
import Name from '../../../src/backend/controller/objects/meta/name';
import { ListProviderLocalData } from '../../../src/backend/controller/objects/list-provider-local-data';

describe('series basic tests', () => {
    it('should have a id', async () => {
        const series = new Series();
        assert.notEqual(series.id.length, 0);
        return;
    });


    it('should return last provider', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData();
        providerA.lastUpdate = new Date(100);
        providerA.watchProgress = [];
        const providerB = new ListProviderLocalData();
        providerB.watchProgress = [];
        providerB.lastUpdate = new Date(50);
        series.addListProvider(providerA, providerB);
        assert.equal(await series['getLastUpdatedProvider'](), providerA);
        return;
    });

    it('should return last watchprogress', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData();
        providerA.lastUpdate = new Date(2);
        providerA.addOneWatchedEpisode(5);
        const providerB = new ListProviderLocalData();
        providerB.lastUpdate = new Date(1);
        providerB.addOneWatchedEpisode(4);
        series.addListProvider(providerA, providerB);
        const result = await series.getLastWatchProgress()
        if (typeof result != 'undefined') {
            assert.equal(result.episode, 5);
        }
        assert.notEqual(typeof result, 'undefined');
        return;
    });

    it('should all episodes (1/3)', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData("TestA");
        providerA.episodes = 10;
        const providerB = new ListProviderLocalData("TestB");
        providerB.episodes = 11;
        series.addListProvider(providerA, providerB);
        const allEpisodes = await series.getAllEpisodes();
        assert.deepStrictEqual(allEpisodes, [10, 11]);
        return;
    });

    it('should all episodes (2/3)', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData();
        providerA.episodes = 10;
        const providerB = new ListProviderLocalData();
        providerB['episodes'] = 11;
        series.addListProvider(providerA, providerB);
        assert.deepStrictEqual(await series.getAllEpisodes(), [10, 11]);
        return;
    });

    it('should all episodes (3/3)', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData();

        series.addListProvider(providerA);
        assert.deepStrictEqual(await series.getAllEpisodes(), []);
        return;
    });

    it('should max episode (1/3)', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData("TestA");
        providerA.episodes = 12;
        const providerB = new ListProviderLocalData("TestB");
        providerB['episodes'] = 11;
        series.addListProvider(providerA, providerB);
        assert.equal(series.getMaxEpisode(), 12);
        return;
    });

    it('should max episode (2/3)', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData("TestA");
        providerA.episodes = 12;
        const providerB = new ListProviderLocalData("TestB");
        providerB.episodes = 24;
        providerB['episodes'] = 11;
        series.addListProvider(providerA, providerB);
        assert.strictEqual(series.getMaxEpisode(), 24);
        return;
    });

    it('should max episode (3/3)', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData();
        providerA.episodes = 12;
        const providerB = new ListProviderLocalData();
        providerB.episodes = 24;
        providerB['episodes'] = 11;
        series.addListProvider(providerA, providerB);
        assert.throws(series.getMaxEpisode);
        return;
    });

    it('should prevent duplicates in names', async () => {
        const series = new Series();
          const providerA = new ListProviderLocalData();
        providerA.addSeriesName(new Name('Test', 'eng'));
        providerA.addSeriesName(new Name('Test', 'eng'));
         series.addListProvider(providerA);
        assert.strictEqual((await series.getAllNames()).length, 1);
    });

    it('should prevent null entrys in names', async () => {
        const series = new Series();
            const providerA = new ListProviderLocalData();
        providerA.addSeriesName(null as unknown as Name);
         series.addListProvider(providerA);
        assert.strictEqual((await series.getAllNames()).length, 0);
    });

    it('should prevent undefined entrys in names', async () => {
        const series = new Series();
            const providerA = new ListProviderLocalData();
        providerA.addSeriesName(undefined as unknown as Name);
           series.addListProvider(providerA);
        assert.strictEqual((await series.getAllNames()).length, 0);
    });
});
