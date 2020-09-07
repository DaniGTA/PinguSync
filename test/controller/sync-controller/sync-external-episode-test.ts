import SyncExternalEpisodes from '../../../src/backend/controller/sync-controller/sync-external-episodes'

describe('CLASS: SyncExternalEpisode', () => {
    describe('isSeriesOnWaitlist()', () => {
        test('should be on waitlist', () => {
            SyncExternalEpisodes['plannedJobList'].push({ providerName: 'a', seriesId: 'a' });
            const result = SyncExternalEpisodes.isSeriesOnWaitlist('a', 'a');
            expect(result).toBe(true);
        });
        test('should not be on waitlist', () => {
            SyncExternalEpisodes['plannedJobList'] = [];
            const result = SyncExternalEpisodes.isSeriesOnWaitlist('a', 'a');
            expect(result).toBe(false);
        });
    });

    describe('canSync()', () => {
        test('should not allow sync', () => {
            SyncExternalEpisodes['plannedJobList'].push({ providerName: 'a', seriesId: 'a' });
            const result = SyncExternalEpisodes['canSync']('a', 'a');
            expect(result).toBe(false);
        });
        test('should allow sync', () => {
            SyncExternalEpisodes['plannedJobList'] = [];
            const result = SyncExternalEpisodes['canSync']('a', 'a');
            expect(result).toBe(true);
        });
    });

    describe('addSyncJob()', () => {
        test('should add sync job', () => {
            SyncExternalEpisodes['plannedJobList'] = [];
            SyncExternalEpisodes.addSyncJob('a', { id: 'a' } as any);
            expect(SyncExternalEpisodes['plannedJobList'].length).toBe(1);
            expect(SyncExternalEpisodes['plannedJobList'][0].seriesId).toBe('a');
        });
    });

    describe('watchRunningJobs', () => {
        test('should not crash on exception', async () => {
            const corruptJob = (async () => { throw new Error(); }) as any;
            await expect(SyncExternalEpisodes['watchRunningJobs']([corruptJob])).resolves.not.toThrow();
        });
    });
});