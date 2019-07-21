import { ProviderInfo } from "../../../src/backend/controller/objects/providerInfo";
import * as assert from 'assert';
import { WatchProgress } from "../../../src/backend/controller/objects/watchProgress";
import { WatchStatus } from "../../../src/backend/controller/objects/anime";
describe('providerTest', () => {
    it('should add to watchlist', async () => {
        const providerInfo = new ProviderInfo();
        providerInfo.addOneEpisode(1);
        providerInfo.addOneEpisode(2);
        providerInfo.addOneEpisode(3);
        if (typeof providerInfo.watchProgress != 'undefined') {
            assert.equal(providerInfo.watchProgress.length, 3);
        } else {
            assert.notEqual(typeof providerInfo.watchProgress, 'undefined');
        }
        return;
    });

    it('should remove from watchlist', async () => {
        const providerInfo = new ProviderInfo();
        providerInfo.addOneEpisode(1);
        providerInfo.addOneEpisode(2);
        providerInfo.addOneEpisode(3);

        providerInfo.removeOneWatchProgress(new WatchProgress(2))
        if (typeof providerInfo.watchProgress != 'undefined') {
            assert.equal(providerInfo.watchProgress.length, 2);
        } else {
            assert.notEqual(typeof providerInfo.watchProgress, 'undefined');
        }
        return;
    });

    it('should return the last watched episode', async () => {
        const providerInfo = new ProviderInfo();
        providerInfo.addOneEpisode(1);
        providerInfo.addOneEpisode(2);
        providerInfo.addOneEpisode(4);
        providerInfo.addOneEpisode(6);
        const result = providerInfo.getHighestWatchedEpisode();
        if (typeof result != 'undefined') {
            assert.equal(result.episode, 6);
        }
        assert.notEqual(typeof result, 'undefined');
        return;
    });

    it('should merge same provider', async () => {
        const providerInfoA = new ProviderInfo();
        providerInfoA.addOneEpisode(1);
        providerInfoA.episodes = 10;
        providerInfoA.score = 11;
        providerInfoA.watchStatus = WatchStatus.CURRENT;
        providerInfoA.sequelId = 10;
        providerInfoA.lastUpdate = new Date(0);
        const providerInfoB = new ProviderInfo();
        providerInfoB.addOneEpisode(1);
        providerInfoB.addOneEpisode(2);
        providerInfoB.episodes = 10;
        providerInfoB.score = 12;
        providerInfoB.watchStatus = WatchStatus.COMPLETED;
        providerInfoB.sequelId = 12;
        providerInfoB.lastUpdate = new Date(1);
        providerInfoB.publicScore = 15;
        providerInfoB.prequelId = 105;

        const providerMerged = await ProviderInfo.mergeProviderInfos(providerInfoA, providerInfoB);
        const result = providerMerged.getHighestWatchedEpisode();
        if (typeof result != 'undefined') {
            assert.equal(result.episode, 2);
        }
        assert.notEqual(typeof result, 'undefined');

        assert.equal(providerMerged.sequelId, 12);
        assert.equal(providerMerged.score, 12);
        assert.equal(providerMerged.watchStatus, WatchStatus.COMPLETED);
        assert.equal(providerMerged.publicScore, 15);
        assert.equal(providerMerged.prequelId, 105);
    })
});
