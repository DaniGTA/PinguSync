
import { deepEqual } from 'assert';
import AniDBProvider from '../../../src/backend/api/anidb/anidb-provider';

describe('AniDB Tests', () => {
    it('should allow download (1/2)', async () => {
        var x = new AniDBProvider(false);
        AniDBProvider.anidbNameManager.lastDownloadTime = undefined;
        deepEqual(x.InternalTesting().needDownload(), true);
        return;
    })
    it('should allow download (2/2)', async () => {
        var a = new AniDBProvider(false);
        var twoDaysInMs = 172800000;
        AniDBProvider.anidbNameManager.lastDownloadTime = new Date(Date.now() - twoDaysInMs * 2);
        deepEqual(a.InternalTesting().needDownload(), true);
        return;
    })
    it('should not allow download', async () => {
        var a = new AniDBProvider(false);
        AniDBProvider.anidbNameManager.lastDownloadTime = new Date(Date.now());
        deepEqual(a.InternalTesting().needDownload(), false);
        return;
    })
});
