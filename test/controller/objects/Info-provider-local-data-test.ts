
import Cover from '../../../src/backend/controller/objects/meta/cover';
import { InfoProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data';


describe('infoProviderLocalData tests', () => {
    test('should merge two', () => {
        const a = new InfoProviderLocalData(1);
        a.episodes = 13;
        a.publicScore = 20;
        a.lastUpdate = new Date(0);
        const b = new InfoProviderLocalData(1);
        b.episodes = 14;
        b.publicScore = 20;
        b.score = 40;
        b.covers.push(new Cover(''));

        const merged = InfoProviderLocalData.mergeProviderInfos(a, b);
        expect(merged.covers.length).toBe(1);
        expect(merged.episodes).toBe(14);
        expect(merged.publicScore).toBe(20);
        expect(merged.score).toBe(40);
        return;
    });

    test('should merge three', () => {
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

        const merged = InfoProviderLocalData.mergeProviderInfos(a, b, c);
        expect(merged.covers.length).toBe(2);
        expect(merged.episodes).toBe(15);
        expect(merged.publicScore).toBe(20);
        expect(merged.lastUpdate.getTime()).toBe(20000);
        return;
    });

    test('should not merge same cover', () => {
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

        const merged = InfoProviderLocalData.mergeProviderInfos(c, b, a);
        expect(merged.covers.length).toBe(1);
        expect(merged.episodes).toBe(15);
        expect(merged.publicScore).toBe(20);
        expect(merged.lastUpdate.getTime()).toBe(2);
        expect(merged.score).toBe(40);
        return;
    });
});
