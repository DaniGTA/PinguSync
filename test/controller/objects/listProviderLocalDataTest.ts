

import { strictEqual } from 'assert';
import Cover from '../../../src/backend/controller/objects/meta/cover';
import { WatchStatus } from '../../../src/backend/controller/objects/series';
import { ProviderInfoStatus } from '../../../src/backend/controller/provider-manager/local-data/interfaces/provider-info-status';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import TestHelper from '../../test-helper';

describe('listProviderLocalData tests', () => {
    before(() => {
       TestHelper.mustHaveBefore(); 
    });
    it('should merge two', async () => {
        const a = new ListProviderLocalData(1);
        a.episodes = 13;
        a.publicScore = 20;
        a.lastUpdate = new Date(0);
        a.targetSeason = 5;
        a.watchStatus = WatchStatus.CURRENT;
        const b = new ListProviderLocalData(1);
        b.episodes = 14;
        b.publicScore = 20;
        b.score = 40;
        b.infoStatus = ProviderInfoStatus.FULL_INFO;
        b.watchStatus = WatchStatus.COMPLETED;
        b.covers.push(new Cover(''));

        const merged = await ListProviderLocalData.mergeProviderInfos(a, b);
        strictEqual(merged.covers.length, 1, 'Cover merge failed');
        strictEqual(merged.episodes, 14, 'Episodes merge failed');
        strictEqual(merged.publicScore, 20, 'Public score merge failed');
        strictEqual(merged.score, 40, 'Score merge failed');
        strictEqual(merged.infoStatus, ProviderInfoStatus.FULL_INFO, 'Should add latest hasFullInfo');
        strictEqual(merged.targetSeason, 5, 'Should merge targetSeason');
        strictEqual(merged.watchStatus, WatchStatus.COMPLETED, 'Should add latest watch status');
        return;
    });

    it('should merge three', async () => {
        const a = new ListProviderLocalData(1);
        a.episodes = 13;
        a.publicScore = 20;
        a.lastUpdate = new Date(0);
        a.covers.push(new Cover('c'));
        const b = new ListProviderLocalData(1);
        b.episodes = 14;
        b.publicScore = 20;
        b.lastUpdate = new Date(1);
        const c = new ListProviderLocalData(1);
        c.episodes = 15;
        c.publicScore = 20;
        c.lastUpdate = new Date(20000);
        c.covers.push(new Cover('x'));


        const merged = await ListProviderLocalData.mergeProviderInfos(a, b, c);
        strictEqual(merged.covers.length, 2, 'Cover merge failed');
        strictEqual(merged.episodes, 15, 'Episodes merge failed');
        strictEqual(merged.publicScore, 20, 'Public score merge failed');
        strictEqual(merged.lastUpdate.getTime(), new Date(20000).getTime(), 'Last update merge failed');
        return;
    });

    it('should not merge same cover', async () => {
        const a = new ListProviderLocalData(1);
        a.episodes = 13;
        a.publicScore = 20;
        a.lastUpdate = new Date(0);
        a.covers.push(new Cover('c'));
        const b = new ListProviderLocalData(1);
        b.episodes = 14;
        b.publicScore = 20;
        b.lastUpdate = new Date(1);
        const c = new ListProviderLocalData(1);
        c.episodes = 15;
        c.publicScore = 20;
        c.score = 40;
        c.lastUpdate = new Date(2);
        c.covers.push(new Cover('c'));


        const merged = await ListProviderLocalData.mergeProviderInfos(c, b, a);
        strictEqual(merged.covers.length, 1);
        strictEqual(merged.episodes, 15);
        strictEqual(merged.publicScore, 20);
        strictEqual(merged.lastUpdate.getTime(), 2);
        strictEqual(merged.score, 40);
        return;
    });
});
