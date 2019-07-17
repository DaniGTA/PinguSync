import AniDBNameList from '../../../src/backend/api/anidb/anidbNameList';
import * as assert from 'assert';
describe('AniDB Tests', () => {
    it('should allow download (1/2)', async () => {
        var x = new AniDBNameList(false);
        AniDBNameList.anidbNameManager.lastDownloadTime = undefined;
        assert.equal(x.InternalTesting().needDownload(), true);
        return;
    })
    it('should allow download (2/2)', async () => {
        var a = new AniDBNameList(false);
        var twoDaysInMs = 172800000;
        AniDBNameList.anidbNameManager.lastDownloadTime = new Date(Date.now() - twoDaysInMs * 2);
        assert.equal(a.InternalTesting().needDownload(), true);
        return;
    })
    it('should not allow download', async () => {
        var a = new AniDBNameList(false);
        AniDBNameList.anidbNameManager.lastDownloadTime = new Date(Date.now());
        assert.equal(a.InternalTesting().needDownload(), false);
        return;
    })
});
