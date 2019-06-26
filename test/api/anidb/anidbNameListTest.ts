import AniDBNameList from '../../../src/backend/api/anidb/anidbNameList';
import * as assert from 'assert';
describe('AniDB Tests', () => {
    it('should allow download', async () => {
        var a = new AniDBNameList(false);
        a.anidbNameManager.lastDownloadTime = undefined;
        assert.equal(a.InternalTesting().needDownload(), true);
        return;
    })
    it('should allow download', async () => {
        var a = new AniDBNameList(false);
        var twoDaysInMs = 172800000;
        a.anidbNameManager.lastDownloadTime = new Date(Date.now() - twoDaysInMs);
        assert.equal(a.InternalTesting().needDownload(), true);
        return;
    })
    it('should not allow download', async () => {
        var a = new AniDBNameList(false);
        a.anidbNameManager.lastDownloadTime = new Date(Date.now());
        assert.equal(a.InternalTesting().needDownload(), false);
        return;
    })
});