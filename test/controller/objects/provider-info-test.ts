
import * as assert from 'assert';
import WatchProgress from '../../../src/backend/controller/objects/meta/watch-progress';
import { WatchStatus } from '../../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import TestHelper from '../../test-helper';

describe('Provider | Watchlist & Merge', () => {
    beforeAll(() => {
        TestHelper.mustHaveBefore();
    });
    test('should add to watchlist', async () => {
        const providerInfo = new ListProviderLocalData(-1);
        providerInfo.addOneWatchedEpisode(1);
        providerInfo.addOneWatchedEpisode(2);
        providerInfo.addOneWatchedEpisode(3);
        if (typeof providerInfo.watchProgress !== 'undefined') {
            assert.equal(providerInfo.watchProgress.length, 3);
        } else {
            assert.notEqual(typeof providerInfo.watchProgress, 'undefined');
        }
        return;
    });

    test('should remove from watchlist', async () => {
        const providerInfo = new ListProviderLocalData(-1);
        providerInfo.addOneWatchedEpisode(1);
        providerInfo.addOneWatchedEpisode(2);
        providerInfo.addOneWatchedEpisode(3);

        providerInfo.removeOneWatchProgress(new WatchProgress(2));
        if (typeof providerInfo.watchProgress !== 'undefined') {
            assert.equal(providerInfo.watchProgress.length, 2);
        } else {
            assert.notEqual(typeof providerInfo.watchProgress, 'undefined');
        }
        return;
    });

    test('should return the last watched episode', async () => {
        const providerInfo = new ListProviderLocalData(-1);
        providerInfo.addOneWatchedEpisode(1);
        providerInfo.addOneWatchedEpisode(2);
        providerInfo.addOneWatchedEpisode(4);
        providerInfo.addOneWatchedEpisode(6);
        const result = providerInfo.getHighestWatchedEpisode();
        if (typeof result !== 'undefined') {
            assert.equal(result.episode, 6);
        }
        assert.notEqual(typeof result, 'undefined');
        return;
    });

    test('should merge same provider', async () => {
        const providerInfoA = new ListProviderLocalData(2);
        providerInfoA.addOneWatchedEpisode(1);
        providerInfoA.episodes = 10;
        providerInfoA.score = 11;
        providerInfoA.watchStatus = WatchStatus.CURRENT;
        providerInfoA.sequelIds.push(10);
        providerInfoA.lastUpdate = new Date(10000);
        const providerInfoB = new ListProviderLocalData(2);
        providerInfoB.addOneWatchedEpisode(1);
        providerInfoB.addOneWatchedEpisode(2);
        providerInfoB.episodes = 10;
        providerInfoB.score = 12;
        providerInfoB.watchStatus = WatchStatus.COMPLETED;
        providerInfoB.sequelIds.push(12);
        providerInfoB.lastUpdate = new Date(20000);
        providerInfoB.publicScore = 15;
        providerInfoB.prequelIds.push(105);

        const providerMerged = await ListProviderLocalData.mergeProviderInfos(providerInfoA, providerInfoB);
        const result = providerMerged.getHighestWatchedEpisode();
        if (typeof result !== 'undefined') {
            assert.equal(result.episode, 2);
        }
        assert.notEqual(typeof result, 'undefined');

        assert.equal(providerMerged.sequelIds, 12, 'should take the last sequel id and throw old ones away');
        assert.equal(providerMerged.score, 12);
        assert.equal(providerMerged.watchStatus, WatchStatus.COMPLETED);
        assert.equal(providerMerged.publicScore, 15);
        assert.equal(providerMerged.prequelIds, 105);
    });
});