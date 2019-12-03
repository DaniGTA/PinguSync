import * as assert from 'assert';
import Name from '../../../src/backend/controller/objects/meta/name';
import Series from '../../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import TestHelper from '../../test-helper';


describe('Series | Basic', () => {
    beforeEach(() => {
        TestHelper.mustHaveBefore();
    });
    it('should have a id', async () => {
        const series = new Series();
        assert.notEqual(series.id.length, 0);
        return;
    });


    it('should return last provider', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData(1, 'A');
        providerA.lastUpdate = new Date(100);
        providerA.watchProgress = [];
        const providerB = new ListProviderLocalData(1, 'B');
        providerB.watchProgress = [];
        providerB.lastUpdate = new Date(50);
        await series.addListProvider(providerA, providerB);
        // tslint:disable-next-line: no-string-literal
        assert.equal(await series['getLastUpdatedProvider'](), providerA);
        return;
    });

    it('should return last watchprogress', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData(1, 'A');
        providerA.lastUpdate = new Date(2);
        providerA.addOneWatchedEpisode(5);
        const providerB = new ListProviderLocalData(1, 'B');
        providerB.lastUpdate = new Date(1);
        providerB.addOneWatchedEpisode(4);
        await series.addListProvider(providerA, providerB);
        const result = await series.getLastWatchProgress();
        if (result) {
            assert.equal(result.episode, 5);
        }
        assert.notEqual(typeof result, 'undefined');
        return;
    });

    it('should all episodes (1/3)', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData(1, 'TestA');
        providerA.episodes = 10;
        const providerB = new ListProviderLocalData(1, 'TestB');
        providerB.episodes = 11;
        await series.addListProvider(providerA, providerB);
        const allEpisodes = await series.getAllEpisodes();
        assert.equal(allEpisodes[0], 10);
        assert.equal(allEpisodes[1], 11);
        assert.equal(allEpisodes.length, 2);
        return;
    });

    it('should all episodes (2/3)', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData(1, 'A');
        providerA.episodes = 10;
        const providerB = new ListProviderLocalData(1, 'B');
        providerB.episodes = 11;
        await series.addListProvider(providerA, providerB);
        assert.deepEqual(await series.getAllEpisodes(), [10, 11]);
        return;
    });

    it('should all episodes (3/3)', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData(1);

        series.addListProvider(providerA);
        assert.deepStrictEqual(await series.getAllEpisodes(), []);
        return;
    });

    it('should max episode (1/3)', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData(1, 'TestA');
        providerA.episodes = 12;
        const providerB = new ListProviderLocalData(1, 'TestB');
        providerB.episodes = 11;
        series.addListProvider(providerA, providerB);
        assert.equal(series.getMaxEpisode(), 12);
        return;
    });

    it('should max episode (2/3)', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData(1, 'TestA');
        providerA.episodes = 12;
        const providerB = new ListProviderLocalData(1, 'TestB');
        providerB.episodes = 24;
        series.addListProvider(providerA, providerB);
        assert.equal(series.getMaxEpisode(), 24);
        return;
    });

    it('should max episode (3/3)', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData(1);
        providerA.episodes = 12;
        const providerB = new ListProviderLocalData(1);
        providerB.episodes = 24;
        // tslint:disable-next-line: no-string-literal
        providerB['episodes'] = 11;
        await series.addListProvider(providerA, providerB);
        assert.throws(series.getMaxEpisode);
        return;
    });

    it('should prevent duplicates in names', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData(1);
        providerA.addSeriesName(new Name('Test', 'eng'));
        providerA.addSeriesName(new Name('Test', 'eng'));
        await series.addListProvider(providerA);
        assert.strictEqual((await series.getAllNames()).length, 1);
    });

    it('should prevent null entrys in names', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData(1);
        providerA.addSeriesName(null as unknown as Name);
        await series.addListProvider(providerA);
        assert.strictEqual((await series.getAllNames()).length, 0);
    });

    it('should prevent undefined entrys in names', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData(1);
        providerA.addSeriesName(undefined as unknown as Name);
        await series.addListProvider(providerA);
        assert.strictEqual((await series.getAllNames()).length, 0);
    });
});
