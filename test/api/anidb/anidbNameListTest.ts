
import AniDBNameProvider from '../../../src/backend/api/anidb/anidbNameProvider';
import { deepEqual } from 'assert';

describe('AniDB Tests', () => {
    it('should allow download (1/2)', async () => {
        var x = new AniDBNameProvider(false);
        AniDBNameProvider.anidbNameManager.lastDownloadTime = undefined;
        deepEqual(x.InternalTesting().needDownload(), true);
        return;
    })
    it('should allow download (2/2)', async () => {
        var a = new AniDBNameProvider(false);
        var twoDaysInMs = 172800000;
        AniDBNameProvider.anidbNameManager.lastDownloadTime = new Date(Date.now() - twoDaysInMs * 2);
        deepEqual(a.InternalTesting().needDownload(), true);
        return;
    })
    it('should not allow download', async () => {
        var a = new AniDBNameProvider(false);
        AniDBNameProvider.anidbNameManager.lastDownloadTime = new Date(Date.now());
        deepEqual(a.InternalTesting().needDownload(), false);
        return;
    })
});
