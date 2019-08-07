import AniDBNameList from '../../../src/backend/api/anidb/anidbNameList';
import { deepEqual } from 'assert';

describe('AniDB Tests', () => {
    it('should allow download (1/2)', async () => {
        var x = new AniDBNameList(false);
        AniDBNameList.anidbNameManager.lastDownloadTime = undefined;
        deepEqual(x.InternalTesting().needDownload(), true);
        return;
    })
    it('should allow download (2/2)', async () => {
        var a = new AniDBNameList(false);
        var twoDaysInMs = 172800000;
        AniDBNameList.anidbNameManager.lastDownloadTime = new Date(Date.now() - twoDaysInMs * 2);
        deepEqual(a.InternalTesting().needDownload(), true);
        return;
    })
    it('should not allow download', async () => {
        var a = new AniDBNameList(false);
        AniDBNameList.anidbNameManager.lastDownloadTime = new Date(Date.now());
        deepEqual(a.InternalTesting().needDownload(), false);
        return;
    })
});
