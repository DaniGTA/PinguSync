import { ProviderInfo } from "../../../src/backend/controller/objects/providerInfo";
import * as assert from 'assert';
import { WatchProgress } from "../../../src/backend/controller/objects/watchProgress";
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

        assert.equal(providerInfo.getHighestWatchedEpisode(), 6);

        return;
    });
});
