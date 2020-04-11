
import { strictEqual } from 'assert';
import Cover from '../../../src/backend/controller/objects/meta/cover';
import { InfoProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data';


describe('infoProviderLocalData tests', () => {
    test('should merge two', async () => {
        const a = new InfoProviderLocalData(1);
        a.episodes = 13;
        a.publicScore = 20;
        a.lastUpdate = new Date(0);
        const b = new InfoProviderLocalData(1);
        b.episodes = 14;
        b.publicScore = 20;
        b.score = 40;
        b.covers.push(new Cover(''));

        const merged = await InfoProviderLocalData.mergeProviderInfos(a, b);
        strictEqual(merged.covers.length, 1, 'Cover merge failed');
        strictEqual(merged.episodes, 14, 'Episodes merge failed');
        strictEqual(merged.publicScore, 20, 'Public score merge failed');
        strictEqual(merged.score, 40, 'Score merge failed');
        return;
    });

    test('should merge three', async () => {
        const a = new InfoProviderLocalData(1);
        a.episodes = 13;
        a.publicScore = 20;
        a.lastUpdate = new Date(0);
        a.covers.push(new Cover('c'));
        const b = new InfoProviderLocalData(1);
        b.episodes = 14;
        b.publicScore = 20;
        b.lastUpdate = new Date(1);
        const c = new InfoProviderLocalData(1);
        c.episodes = 15;
        c.publicScore = 20;
        c.lastUpdate = new Date(20000);
        c.covers.push(new Cover('x'));


        const merged = await InfoProviderLocalData.mergeProviderInfos(a, b, c);
        strictEqual(merged.covers.length, 2, 'Cover merge failed');
        strictEqual(merged.episodes, 15, 'Episodes merge failed');
        strictEqual(merged.publicScore, 20, 'Public score merge failed');
        strictEqual(merged.lastUpdate.getTime(), 20000, 'Last update merge failed');
        return;
    });

    test('should not merge same cover', async () => {
        const a = new InfoProviderLocalData(1);
        a.episodes = 13;
        a.publicScore = 20;
        a.lastUpdate = new Date(0);
        a.covers.push(new Cover('c'));
        const b = new InfoProviderLocalData(1);
        b.episodes = 14;
        b.publicScore = 20;
        b.lastUpdate = new Date(1);
        const c = new InfoProviderLocalData(1);
        c.episodes = 15;
        c.publicScore = 20;
        c.score = 40;
        c.lastUpdate = new Date(2);
        c.covers.push(new Cover('c'));


        const merged = await InfoProviderLocalData.mergeProviderInfos(c, b, a);
        strictEqual(merged.covers.length, 1, 'Cover merge failed');
        strictEqual(merged.episodes, 15);
        strictEqual(merged.publicScore, 20);
        strictEqual(merged.lastUpdate.getTime(), 2);
        strictEqual(merged.score, 40);
        return;
    });
});
